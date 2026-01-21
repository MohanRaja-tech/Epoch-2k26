"""
Script to delete fake registrations from MongoDB
Identifies fake registrations based on patterns observed in the data
"""

from pymongo import MongoClient
import re
from urllib.parse import quote_plus

# MongoDB connection - URL encode username and password for special characters
username = quote_plus("mohantwo3_db_user")
password = quote_plus("Techiee@2k24")  # URL encode the password (@ symbol needs encoding)
MONGODB_URI = f"mongodb+srv://{username}:{password}@cluster0.ldaceh1.mongodb.net/"

# Connect to MongoDB
client = MongoClient(MONGODB_URI)
db = client['epoch_2026']  # Correct database name from app.py
collection = db['users']  # Your collection name

def identify_fake_registrations():
    """
    Identify fake registrations based on observed patterns:
    1. Names like "user1", "user21", "user22" etc.
    2. Emails like "user21@mail.com" pattern
    3. Phone numbers with pattern like 9800000021, 9800000022 (sequential)
    4. Generic test data patterns
    """
    
    fake_patterns = {
        # Pattern 1: Names that are just "user" followed by numbers
        "name_pattern": re.compile(r'^user\d+$', re.IGNORECASE),
        
        # Pattern 2: Emails with userXX@mail.com pattern
        "email_pattern": re.compile(r'^user\d+@mail\.com$', re.IGNORECASE),
        
        # Pattern 3: Phone numbers with suspicious sequential patterns (980000000X)
        "phone_pattern": re.compile(r'^98000000\d{2}$'),
    }
    
    # Query to find fake registrations using $or for multiple conditions
    fake_query = {
        "$or": [
            # Match names like "user1", "user21", etc.
            {"name": {"$regex": r"^user\d+$", "$options": "i"}},
            
            # Match emails like "user21@mail.com"
            {"email": {"$regex": r"^user\d+@mail\.com$", "$options": "i"}},
            
            # Match phone numbers with pattern 98000000XX
            {"phone": {"$regex": r"^98000000\d{2}$"}},
            
            # Additional patterns for test/fake data
            {"name": {"$regex": r"^test\d*$", "$options": "i"}},
            {"email": {"$regex": r"^test\d*@", "$options": "i"}},
        ]
    }
    
    return fake_query

def preview_fake_registrations():
    """Preview fake registrations before deletion"""
    fake_query = identify_fake_registrations()
    
    print("=" * 60)
    print("FAKE REGISTRATIONS FOUND (Preview)")
    print("=" * 60)
    
    fake_records = list(collection.find(fake_query))
    
    if not fake_records:
        print("No fake registrations found!")
        return []
    
    for i, record in enumerate(fake_records, 1):
        print(f"\n--- Record {i} ---")
        print(f"  ID: {record.get('_id')}")
        print(f"  Name: {record.get('name')}")
        print(f"  Email: {record.get('email')}")
        print(f"  Phone: {record.get('phone')}")
        print(f"  College: {record.get('college')}")
        print(f"  Epoch ID: {record.get('epochId')}")
        print(f"  Created At: {record.get('createdAt')}")
    
    print(f"\n{'=' * 60}")
    print(f"Total fake registrations found: {len(fake_records)}")
    print("=" * 60)
    
    return fake_records

def delete_fake_registrations(dry_run=True):
    """
    Delete fake registrations
    
    Args:
        dry_run: If True, only shows what would be deleted without actually deleting
    """
    fake_query = identify_fake_registrations()
    
    if dry_run:
        print("\n[DRY RUN MODE] - No actual deletion will occur")
        fake_records = preview_fake_registrations()
        
        if fake_records:
            print("\nTo actually delete these records, run with dry_run=False")
        return
    
    # Actual deletion
    print("\n[DELETION MODE] - Removing fake registrations...")
    
    # First, get count and preview
    count = collection.count_documents(fake_query)
    
    if count == 0:
        print("No fake registrations found to delete!")
        return
    
    print(f"Found {count} fake registrations to delete.")
    
    # Confirm deletion
    confirm = input(f"\nAre you sure you want to delete {count} fake registrations? (yes/no): ")
    
    if confirm.lower() != 'yes':
        print("Deletion cancelled.")
        return
    
    # Perform deletion
    result = collection.delete_many(fake_query)
    
    print(f"\n✅ Successfully deleted {result.deleted_count} fake registrations!")

def main():
    print("\n" + "=" * 60)
    print("FAKE REGISTRATION CLEANUP SCRIPT")
    print("=" * 60)
    
    print("\nThis script identifies fake registrations with patterns like:")
    print("  - Names: user1, user21, user22, test, etc.")
    print("  - Emails: user21@mail.com, test@mail.com, etc.")
    print("  - Phone: 9800000021, 9800000022, etc.")
    
    # Show total records count
    total = collection.count_documents({})
    print(f"\nTotal records in database: {total}")
    
    print("\n" + "-" * 60)
    print("Choose an option:")
    print("  1. Preview fake registrations (recommended first)")
    print("  2. Delete fake registrations")
    print("  3. Show all records (debug)")
    print("  4. Exit")
    print("-" * 60)
    
    choice = input("\nEnter your choice (1/2/3/4): ").strip()
    
    if choice == '1':
        preview_fake_registrations()
    elif choice == '2':
        # First do a dry run
        print("\nFirst, let's preview what will be deleted...")
        preview_fake_registrations()
        
        proceed = input("\nProceed with deletion? (yes/no): ")
        if proceed.lower() == 'yes':
            delete_fake_registrations(dry_run=False)
        else:
            print("Deletion cancelled.")
    elif choice == '3':
        # Debug: show all records
        print("\n=== ALL RECORDS IN DATABASE ===")
        all_records = list(collection.find({}).limit(50))
        for i, rec in enumerate(all_records, 1):
            print(f"\n--- Record {i} ---")
            print(f"  Name: {rec.get('name')}")
            print(f"  Email: {rec.get('email')}")
            print(f"  Phone: {rec.get('phone')}")
            print(f"  Epoch ID: {rec.get('epochId')}")
        print(f"\nShowing {len(all_records)} records (max 50)")
    elif choice == '4':
        print("Exiting...")
    else:
        print("Invalid choice!")

if __name__ == "__main__":
    main()
    
    # Close connection
    client.close()
