"""
EPOCH 2026 - Flask Backend
User Registration and Login Authentication with MongoDB
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError
from dotenv import load_dotenv
import os
import base64
import random
from datetime import datetime

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

# MongoDB connection
MONGODB_URI = os.getenv('MONGODB_URI')
if MONGODB_URI:
    # Clean up URI format if needed
    MONGODB_URI = MONGODB_URI.strip()
    
    # Parse and URL-encode credentials if they contain special characters
    # The password contains @ symbol which needs to be encoded
    import urllib.parse
    
    try:
        # Extract components from the URI
        # Format: mongodb+srv://username:password@host/
        if 'mongodb+srv://' in MONGODB_URI or 'mongodb://' in MONGODB_URI:
            prefix = 'mongodb+srv://' if 'mongodb+srv://' in MONGODB_URI else 'mongodb://'
            rest = MONGODB_URI.replace(prefix, '')
            
            # Find the last @ which separates credentials from host
            # Split on @ to get parts
            at_index = rest.rfind('@')
            if at_index > 0:
                credentials = rest[:at_index]
                host = rest[at_index+1:]
                
                # Split credentials into username and password
                colon_index = credentials.find(':')
                if colon_index > 0:
                    username = credentials[:colon_index]
                    password = credentials[colon_index+1:]
                    
                    # URL-encode the username and password
                    username_encoded = urllib.parse.quote_plus(username)
                    password_encoded = urllib.parse.quote_plus(password)
                    
                    # Reconstruct the URI
                    MONGODB_URI = f"{prefix}{username_encoded}:{password_encoded}@{host}"
        
        client = MongoClient(MONGODB_URI)
        db = client['epoch_2026']
        users_collection = db['users']
        
        # Event registration collections
        event_collections = {
            'paper-presentation': db['paper_presentation_registrations'],
            'binary-battle': db['binary_battle_registrations'],
            'prompt-arena': db['prompt_arena_registrations'],
            'connection': db['connection_registrations'],
            'flipflop': db['flipflop_registrations']
        }
        
        # Create unique index on email and epochId
        users_collection.create_index('email', unique=True)
        users_collection.create_index('epochId', unique=True, sparse=True)
        print("✅ Connected to MongoDB successfully!")
    except Exception as e:
        print(f"❌ MongoDB connection error: {e}")
        db = None
        users_collection = None
        event_collections = {}
else:
    print("⚠️ MONGODB_URI not found in environment variables")
    db = None
    users_collection = None
    event_collections = {}

# Constants
MAX_REGISTRATIONS = 200

# Event configuration
TECH_EVENTS = ['paper-presentation', 'binary-battle', 'prompt-arena']
NONTECH_EVENTS = ['connection', 'flipflop']
MAX_TECH_EVENTS_PER_USER = 2
MAX_NONTECH_EVENTS_PER_USER = 1

# Event-specific limits
MAX_PAPER_PRESENTATION_TEAMS = 60


# Serve static files (disabled for Vercel - static files served directly)
# Uncomment these routes for local development
#@app.route('/')
#def index():
#    return send_from_directory('.', 'index.html')


#@app.route('/<path:path>')
#def serve_static(path):
#   return send_from_directory('.', path)


# API: User Registration
@app.route('/api/register', methods=['POST'])
def register():
    """Register a new user"""
    if users_collection is None:
        return jsonify({
            'success': False,
            'message': 'Database connection not available'
        }), 500
    
    try:
        # Check registration count first
        current_count = users_collection.count_documents({'epochId': {'$exists': True}})
        if current_count >= MAX_REGISTRATIONS:
            return jsonify({
                'success': False,
                'message': 'Registration closed! Maximum 200 registrations have been reached.',
                'registrationsClosed': True
            }), 403
        
        # Get form data
        data = request.form.to_dict()
        
        # Required fields validation
        required_fields = ['name', 'email', 'password', 'phone', 'college', 'department', 'year', 'foodPriority', 'transactionId']
        for field in required_fields:
            if field not in data or not data[field].strip():
                return jsonify({
                    'success': False,
                    'message': f'Missing required field: {field}'
                }), 400
        
        # Handle payment screenshot file
        payment_screenshot = None
        if 'paymentScreenshot' in request.files:
            file = request.files['paymentScreenshot']
            if file and file.filename:
                # Check file size (max 100KB)
                file.seek(0, 2)  # Seek to end
                file_size = file.tell()
                file.seek(0)  # Reset to beginning
                
                if file_size > 100 * 1024:  # 100KB
                    return jsonify({
                        'success': False,
                        'message': 'Payment screenshot must be less than or equal to 100KB'
                    }), 400
                
                # Read and encode as base64
                file_content = file.read()
                payment_screenshot = base64.b64encode(file_content).decode('utf-8')
        
        # Check if email already exists
        existing_user = users_collection.find_one({'email': data['email'].lower()})
        if existing_user:
            return jsonify({
                'success': False,
                'message': 'Email already registered. Please login instead.'
            }), 409
        
        # Generate EPOCH ID (EPOCH001 to EPOCH200)
        # Find the highest existing EPOCH number using multiple methods for reliability
        next_number = 1
        
        # Method 1: Find highest epochNumber field
        pipeline = [
            {'$match': {'epochNumber': {'$exists': True, '$type': 'int'}}},
            {'$group': {'_id': None, 'maxNum': {'$max': '$epochNumber'}}}
        ]
        result = list(users_collection.aggregate(pipeline))
        if result and result[0].get('maxNum'):
            next_number = result[0]['maxNum'] + 1
        
        # Method 2: Also check by parsing epochId strings (backup method)
        all_users = users_collection.find({'epochId': {'$exists': True}})
        for user in all_users:
            epoch_id = user.get('epochId', '')
            if epoch_id.startswith('EPOCH'):
                try:
                    num = int(epoch_id.replace('EPOCH', ''))
                    if num >= next_number:
                        next_number = num + 1
                except ValueError:
                    pass
        
        # Double check we haven't exceeded limit
        if next_number > MAX_REGISTRATIONS:
            return jsonify({
                'success': False,
                'message': 'Registration closed! Maximum 200 registrations have been reached.',
                'registrationsClosed': True
            }), 403
        
        # Format EPOCH ID as EPOCH001, EPOCH002, etc.
        epoch_id = f"EPOCH{next_number:03d}"
        
        # Create user document
        user_doc = {
            'name': data['name'].strip(),
            'email': data['email'].lower().strip(),
            'password': generate_password_hash(data['password']),
            'phone': data['phone'].strip(),
            'college': data['college'].strip(),
            'department': data['department'].strip(),
            'yearOfStudy': data['year'].strip(),
            'foodPriority': data['foodPriority'].strip(),
            'transactionId': data['transactionId'].strip(),
            'paymentScreenshot': payment_screenshot,
            'epochId': epoch_id,
            'epochNumber': next_number,
            'createdAt': datetime.utcnow()
        }
        
        # Insert into database
        result = users_collection.insert_one(user_doc)
        
        if result.inserted_id:
            return jsonify({
                'success': True,
                'message': 'Registration successful!',
                'epochId': epoch_id,
                'registrationNumber': next_number,
                'remainingSlots': MAX_REGISTRATIONS - next_number
            }), 201
        else:
            return jsonify({
                'success': False,
                'message': 'Registration failed. Please try again.'
            }), 500
            
    except DuplicateKeyError:
        return jsonify({
            'success': False,
            'message': 'Email already registered. Please login instead.'
        }), 409
    except Exception as e:
        print(f"Registration error: {e}")
        return jsonify({
            'success': False,
            'message': 'An error occurred during registration. Please try again.'
        }), 500


# API: User Login
@app.route('/api/login', methods=['POST'])
def login():
    """Authenticate user login"""
    if users_collection is None:
        return jsonify({
            'success': False,
            'message': 'Database connection not available'
        }), 500
    
    try:
        data = request.get_json()
        
        # Required fields validation
        if not data or 'email' not in data or 'password' not in data:
            return jsonify({
                'success': False,
                'message': 'Email and password are required'
            }), 400
        
        email = data['email'].lower().strip()
        password = data['password']
        
        # Find user by email
        user = users_collection.find_one({'email': email})
        
        if not user:
            return jsonify({
                'success': False,
                'message': 'Invalid email or password'
            }), 401
        
        # Verify password
        if not check_password_hash(user['password'], password):
            return jsonify({
                'success': False,
                'message': 'Invalid email or password'
            }), 401
        
        # Login successful
        return jsonify({
            'success': True,
            'message': 'Login successful!',
            'user': {
                'name': user['name'],
                'email': user['email'],
                'epochId': user.get('epochId', 'N/A'),
                'college': user.get('college', ''),
                'department': user.get('department', ''),
                'phone': user.get('phone', '')
            }
        }), 200
        
    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({
            'success': False,
            'message': 'An error occurred during login. Please try again.'
        }), 500


# API: Check if email exists
@app.route('/api/check-email', methods=['POST'])
def check_email():
    """Check if email is already registered"""
    if users_collection is None:
        return jsonify({'exists': False}), 200
    
    try:
        data = request.get_json()
        email = data.get('email', '').lower().strip()
        
        if not email:
            return jsonify({'exists': False}), 200
        
        existing = users_collection.find_one({'email': email})
        return jsonify({'exists': existing is not None}), 200
        
    except Exception as e:
        print(f"Check email error: {e}")
        return jsonify({'exists': False}), 200


# API: Get registration status
@app.route('/api/registration-status', methods=['GET'])
def registration_status():
    """Get current registration status and remaining slots"""
    if users_collection is None:
        return jsonify({
            'isOpen': False,
            'message': 'Database connection not available'
        }), 200
    
    try:
        current_count = users_collection.count_documents({'epochId': {'$exists': True}})
        remaining_slots = MAX_REGISTRATIONS - current_count
        is_open = current_count < MAX_REGISTRATIONS
        
        return jsonify({
            'isOpen': is_open,
            'totalSlots': MAX_REGISTRATIONS,
            'registeredCount': current_count,
            'remainingSlots': remaining_slots,
            'message': 'Registration open' if is_open else 'Registration closed! Maximum 200 registrations have been reached.'
        }), 200
        
    except Exception as e:
        print(f"Registration status error: {e}")
        return jsonify({
            'isOpen': True,
            'totalSlots': MAX_REGISTRATIONS,
            'remainingSlots': MAX_REGISTRATIONS
        }), 200


# API: Validate EPOCH IDs
@app.route('/api/validate-epoch-id', methods=['POST'])
def validate_epoch_ids():
    """Validate if EPOCH IDs exist in the database"""
    if users_collection is None:
        return jsonify({
            'success': False,
            'message': 'Database connection not available'
        }), 500
    
    try:
        data = request.get_json()
        epoch_ids = data.get('epochIds', [])
        
        if not epoch_ids:
            return jsonify({
                'valid': False,
                'message': 'No EPOCH IDs provided',
                'invalidIds': [],
                'validIds': []
            }), 400
        
        valid_ids = []
        invalid_ids = []
        
        for epoch_id in epoch_ids:
            if not epoch_id:
                continue
            epoch_id_upper = epoch_id.upper().strip()
            user = users_collection.find_one({'epochId': epoch_id_upper})
            if user:
                valid_ids.append(epoch_id_upper)
            else:
                invalid_ids.append(epoch_id_upper)
        
        return jsonify({
            'valid': len(invalid_ids) == 0,
            'invalidIds': invalid_ids,
            'validIds': valid_ids,
            'message': 'All EPOCH IDs are valid' if len(invalid_ids) == 0 else f'Invalid EPOCH IDs: {", ".join(invalid_ids)}'
        }), 200
        
    except Exception as e:
        print(f"Validate EPOCH ID error: {e}")
        return jsonify({
            'valid': False,
            'message': 'An error occurred during validation'
        }), 500


# API: Register for an event
@app.route('/api/register-event', methods=['POST'])
def register_event():
    """Register for an event and update user tech/nontech counts"""
    if users_collection is None or not event_collections:
        return jsonify({
            'success': False,
            'message': 'Database connection not available'
        }), 500
    
    try:
        data = request.get_json()
        
        event_id = data.get('eventId', '').strip()
        event_name = data.get('eventName', '').strip()
        team_name = data.get('teamName', '').strip()
        paper_title = data.get('paperTitle', '').strip()
        
        # Get participants
        participants = []
        for i in range(1, 4):
            participant = data.get(f'participant{i}', {})
            if participant and participant.get('epochId'):
                participants.append({
                    'epochId': participant.get('epochId', '').upper().strip(),
                    'name': participant.get('name', '').strip(),
                    'college': participant.get('college', '').strip(),
                    'mobile': participant.get('mobile', '').strip()
                })
        
        if not event_id or not participants:
            return jsonify({
                'success': False,
                'message': 'Event ID and at least one participant required'
            }), 400
        
        # Check if event collection exists
        if event_id not in event_collections:
            return jsonify({
                'success': False,
                'message': f'Invalid event: {event_id}'
            }), 400
        
        # Check paper presentation team limit
        if event_id == 'paper-presentation':
            event_collection = event_collections[event_id]
            current_count = event_collection.count_documents({})
            
            if current_count >= MAX_PAPER_PRESENTATION_TEAMS:
                return jsonify({
                    'success': False,
                    'message': f'Paper Presentation registrations are now closed! Maximum limit of {MAX_PAPER_PRESENTATION_TEAMS} teams has been reached.',
                    'eventFull': True,
                    'eventId': event_id,
                    'eventName': 'Paper Presentation',
                    'currentCount': current_count,
                    'maxLimit': MAX_PAPER_PRESENTATION_TEAMS
                }), 403
        
        # Validate all EPOCH IDs exist
        epoch_ids = [p['epochId'] for p in participants]
        invalid_ids = []
        for epoch_id in epoch_ids:
            user = users_collection.find_one({'epochId': epoch_id})
            if not user:
                invalid_ids.append(epoch_id)
        
        if invalid_ids:
            return jsonify({
                'success': False,
                'message': f'Invalid EPOCH IDs not found in database: {", ".join(invalid_ids)}',
                'invalidIds': invalid_ids
            }), 400
        
        # Check registration limits for each participant
        is_tech_event = event_id in TECH_EVENTS
        is_nontech_event = event_id in NONTECH_EVENTS
        
        for epoch_id in epoch_ids:
            user = users_collection.find_one({'epochId': epoch_id})
            tech_count = user.get('technicalEventsCount', 0)
            nontech_count = user.get('nonTechnicalEventsCount', 0)
            
            if is_tech_event and tech_count >= MAX_TECH_EVENTS_PER_USER:
                return jsonify({
                    'success': False,
                    'message': f'EPOCH ID {epoch_id} has already registered for {MAX_TECH_EVENTS_PER_USER} technical events. Maximum limit reached!',
                    'limitExceeded': True,
                    'epochId': epoch_id
                }), 400
            
            if is_nontech_event and nontech_count >= MAX_NONTECH_EVENTS_PER_USER:
                return jsonify({
                    'success': False,
                    'message': f'EPOCH ID {epoch_id} has already registered for {MAX_NONTECH_EVENTS_PER_USER} non-technical event. Maximum limit reached!',
                    'limitExceeded': True,
                    'epochId': epoch_id
                }), 400
        
        # Generate registration ID
        prefixes = {
            'paper-presentation': 'PPT',
            'binary-battle': 'BBT',
            'prompt-arena': 'PMA',
            'connection': 'CON',
            'flipflop': 'FLP'
        }
        prefix = prefixes.get(event_id, 'EVT')
        timestamp = datetime.utcnow().strftime('%H%M%S')
        random_num = random.randint(100, 999)
        registration_id = f"{prefix}-{timestamp}-{random_num}"
        
        # Create registration document
        registration_doc = {
            'registrationId': registration_id,
            'eventId': event_id,
            'eventName': event_name,
            'teamName': team_name,
            'paperTitle': paper_title if event_id == 'paper-presentation' else None,
            'participants': participants,
            'participantEpochIds': epoch_ids,
            'registrationTime': datetime.utcnow(),
            'status': 'confirmed'
        }
        
        # Insert into event collection
        event_collection = event_collections[event_id]
        result = event_collection.insert_one(registration_doc)
        
        if result.inserted_id:
            # Update tech/nontech counts for each participant
            for epoch_id in epoch_ids:
                if is_tech_event:
                    users_collection.update_one(
                        {'epochId': epoch_id},
                        {
                            '$inc': {'technicalEventsCount': 1},
                            '$push': {'registeredEvents': registration_id}
                        }
                    )
                elif is_nontech_event:
                    users_collection.update_one(
                        {'epochId': epoch_id},
                        {
                            '$inc': {'nonTechnicalEventsCount': 1},
                            '$push': {'registeredEvents': registration_id}
                        }
                    )
            
            return jsonify({
                'success': True,
                'message': f'Successfully registered for {event_name}!',
                'registrationId': registration_id,
                'eventName': event_name,
                'teamName': team_name,
                'participantCount': len(participants)
            }), 201
        else:
            return jsonify({
                'success': False,
                'message': 'Failed to save registration. Please try again.'
            }), 500
            
    except Exception as e:
        print(f"Event registration error: {e}")
        return jsonify({
            'success': False,
            'message': 'An error occurred during registration. Please try again.'
        }), 500


# API: Get registration counts for an EPOCH ID
@app.route('/api/registration-counts/<epoch_id>', methods=['GET'])
def get_registration_counts(epoch_id):
    """Get tech/nontech event counts for an EPOCH ID"""
    if users_collection is None:
        return jsonify({
            'success': False,
            'message': 'Database connection not available'
        }), 500
    
    try:
        epoch_id_upper = epoch_id.upper().strip()
        user = users_collection.find_one({'epochId': epoch_id_upper})
        
        if not user:
            return jsonify({
                'success': False,
                'message': f'EPOCH ID {epoch_id_upper} not found'
            }), 404
        
        return jsonify({
            'success': True,
            'epochId': epoch_id_upper,
            'technicalEventsCount': user.get('technicalEventsCount', 0),
            'nonTechnicalEventsCount': user.get('nonTechnicalEventsCount', 0),
            'maxTechEvents': MAX_TECH_EVENTS_PER_USER,
            'maxNonTechEvents': MAX_NONTECH_EVENTS_PER_USER,
            'registeredEvents': user.get('registeredEvents', [])
        }), 200
        
    except Exception as e:
        print(f"Get registration counts error: {e}")
        return jsonify({
            'success': False,
            'message': 'An error occurred'
        }), 500


# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    """Check API health status"""
    db_status = 'connected' if users_collection is not None else 'disconnected'
    registration_count = 0
    if users_collection:
        try:
            registration_count = users_collection.count_documents({'epochId': {'$exists': True}})
        except:
            pass
    return jsonify({
        'status': 'ok',
        'database': db_status,
        'registrations': registration_count,
        'maxRegistrations': MAX_REGISTRATIONS,
        'timestamp': datetime.utcnow().isoformat()
    }), 200


if __name__ == '__main__':
    print("\n" + "="*50)
    print("🎮 EPOCH 2026 Backend Server")
    print("="*50)
    print(f"🌐 Server running at: http://localhost:5000")
    print(f"📁 Serving static files from current directory")
    print("="*50 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
