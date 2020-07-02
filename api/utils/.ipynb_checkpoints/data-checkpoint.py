import pymongo
import hashlib


# Replace with database name 
DATABASE = "microfarms"
# Replace with collection name(s)
COLLECTION_USERS = "users"
COLLECTION_TENANTS = "tenants"
COLLECTION_LANDOWNERS = "landowners"
COLLECTION_LAND = "land"
COLLECTION_PLOTS = "plots"
COLLECTION_SUPPLIERS = "suppliers"
COLLECTION_BUYERS = "buyers"


# STARTUP METHODS

def connect(MONGO_DB):
    print(f"[INFO] Connecting to MongoDB Atlas", flush=True)

    try:
        client = pymongo.MongoClient(MONGO_DB)
        if DATABASE in client.list_database_names():
            db = client[DATABASE]
            return db
        else:
            return False
    except Exception as err:
        print(f"[CRIT] Error connecting to MongoDB Atlas", flush=True)
        print(f"{err}", flush=True)
        return False


# ADD USER METHOD

def add_user(db, uname, passwd, role, email, phoneNo):
    '''function to add a new user to the database, using uname as unique field for logins'''
    try:
        users_col = db[COLLECTION_USERS]
        # check for uname taken error
        
        if(len(get_user(db, uname)) > 0 or len(get_user_email(db, email)) > 0):
            print("username ", get_user(db, uname))
            print("email ", get_user_email(db, email))
            return {"status": "Username or Email already taken"}
        # create a new mongo object 
        newUser = { "uname": uname, "pwd":  passwd, "role": role,"fName": "", "lName": "", "email": email, "phoneNo": phoneNo, "sessionID": "" }
        # try to insert object into database
        completeStatus = users_col.insert_one(newUser)
        
        # if role is Tenant, create empty Tenant Entry
        if(role == "tenant"):
            createTableEntry(db, COLLECTION_TENANTS, { "uname": uname, "plots":  [[]], "totalBillAmt": 0, "notice": [[]], "produce": [[]], "billDate": [[]] })
            
        # if role is Landowner, create empty Landowner Entry
        if(role == "landowner"):
            createTableEntry(db, COLLECTION_LANDOWNERS, { "uname": uname, "landIDs":  []})
            
        # if role is buyer, create empty Buyer Entry
        if(role == "buyer"):
            createTableEntry(db, COLLECTION_BUYERS, {"uname": uname, "buying": [[]]})
            
        # if role is seller, create empty Seller Entry
        if(role == "supplier"):
            createTableEntry(db, COLLECTION_SUPPLIERS, {"uname": uname, "selling": [[]]})
        
        return {"status": "Account created successfully"} 
    except Exception as err:
        print(f"[CRIT] An error occured with MongoDB Atlas", flush=True)
        print(f"{err}", flush=True)
        return None

    
# MAIN METHODS

def get_user(db, uname):
    """Returns a user object stored within MongoDB Atlas if username given is present"""
    return getTableEntry(db, COLLECTION_USERS, { "uname": uname })
    
def get_user_email(db, email):
    """Returns a user object stored within MongoDB Atlas if email given is present"""
    return getTableEntry(db, COLLECTION_USERS, { "email": email })
    
def getSession(db, sessionID):
    '''Returns a user object stored within MongoDB Atlas if sessionID given is present'''
    return getTableEntry(db, COLLECTION_USERS, { "sessionID": sessionID })

def updateSessionID(db, sessionID, username):
    '''Updates the sessionID of a user, provided the username is found (user assumed already authenticated)'''
    return updateTableEntry(db, COLLECTION_USERS, { "uname": username }, { "$set": { "sessionID": sessionID } })

def getTenantData(db, uname):
    print(uname)
    return getTableEntry(db, COLLECTION_TENANTS, { "uname": uname })


# implemented but not called

def getLandownerData(db, uname):
    return getTableEntry(db, COLLECTION_LANDOWNERS, { "uname": uname })

def getBuyerData(db, uname):
    return getTableEntry(db, COLLECTION_BUYERS, { "uname": uname })

def getSupplierData(db, uname):
    return getTableEntry(db, COLLECTION_SUPPLIERS, { "uname": uname })
    
    
### MASTER METHODS

def getAllFromTable(db, collection):
    try:
        users_col = db[collection]
        users = users_col.find({}, {"_id": 0})
        user_list = []
        for user in users:
            user_list.append(user)
        return user_list
    except Exception as err:
        print(f"[CRIT] An error occured with MongoDB Atlas", flush=True)
        print(f"{err}", flush=True)
        return None

def getTableEntry(db, collection, identifier):
    try:
        col = db[collection]
        myquery = identifier # example: { "uname": uname }
        found = col.find(myquery)
        found_list = []
        for item in found:
            found_list.append(item)
        return found_list
    except Exception as err:
        print(f"[CRIT] An error occured with MongoDB Atlas", flush=True)
        print(f"{err}", flush=True)
        return None
    
def createTableEntry(db, collection, document):
    '''function to create a table entry given a collection and a document, not used for updating individual docs'''
    try:
        col = db[collection]
        # create a new mongo object 
        newDoc = document
        # try to insert object into database
        completeStatus = col.insert_one(newDoc)
        return completeStatus
    except Exception as err:
        print(f"[CRIT] An error occured with MongoDB Atlas", flush=True)
        print(f"{err}", flush=True)
        return None
    
def updateTableEntry(db, collection, identifier, toUpdate):
    '''function to update a table entry given criteria, not used for creating individual docs'''
    try:
        col = db[collection]
        myquery = identifier # example: {"uname": uname}
        newvalues = toUpdate # example: { "$set": { "sessionID": sessionID } }
        return col.update_one(myquery, newvalues)

    except Exception as err:
        print(f"[CRIT] An error occured with MongoDB Atlas", flush=True)
        print(f"{err}", flush=True)
        return None
    
### Alt functions
    
def saltAndHash(password):
    '''Simple hashing function, takes string and returns salted hash'''
    # hardcoded salt for database security
    salt = "DA27mDAqNLjzrcb4NfK7ZvTkVLXUkyUk"
    password += salt
    # return hashed string
    return hashlib.sha256(password.encode('utf-8')).hexdigest()