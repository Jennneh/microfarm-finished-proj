from utils import data
import json 
import secrets
import datetime
from dateutil.relativedelta import *

def test():
    """Tests API connection"""
    return "OK"

def getUser(db, uname):
    """Returns user contained with db if present"""
    return data.get_user(db, uname)

def addUser(db, uname, passwd, role, email, phoneNo):
    '''Returns status (boolean) on user object added to mongo'''
    return data.add_user(db, uname, passwd, role, email, phoneNo)

def authUser(db, uname, passwd):
    '''Returns status (boolean) on user authentication, would imagine more is needed later'''
    # gets user object from database
    currentUser = data.get_user(db, uname)
    # if user is not found
    if(currentUser == []):
        return False
    # if username and hashed password match given data return True (can be other data as well if needed)
    if(uname == currentUser[0]['uname'] and passwd == currentUser[0]['pwd']):
        return True
    else:
        return False

def getPlots(db, sessionID):
    '''Returns the plot data for every plot associated to a user'''
    # use session ID to get the uname of the tenant from USERS
    uname = data.getSession(db, sessionID)[0]['uname']
    # use uname to get plots array from TENANTS
    plotData = data.getTenantData(db, uname)
    if(plotData == []):
        return [["No Plots Found", "", ""]]
    else:
        return plotData[0]['plots']
    
def getBills(db, sessionID):
    '''Gets the bills for the tenant based on sessionID'''
     # use session ID to get the uname of the tenant from USERS
    uname = data.getSession(db, sessionID)[0]['uname']
    # use uname to get plots array from TENANTS
    plotData = data.getTenantData(db, uname)
    if(len(plotData) > 0):
        # return the total bill amount
        return plotData[0]['totalBillAmt']
    else:
        return ["No Bills Found"]
    
def getInterestedBuyers(db, sessionID):
    '''Gets the buyer objects that are buying what the tenant plots are producing'''
    buyerList = []
    # get user from sessionID
    userObject = data.getSession(db, sessionID)
    if(userObject == []):
        return None
    
    # get username from sessionID into variable
    uname = userObject[0]['uname']
    # get tenant object from username
    tenantObject = data.getTableEntry(db, data.COLLECTION_TENANTS, {"uname": uname})
    # if the user is a tenant
    if(tenantObject == []):
        return None
    
    # get the specific produce of the tenant
    sellingObject = tenantObject[0]['produce']
    if(sellingObject == []):
        return None
    
    # get all buyers
    buyersObject = data.getAllFromTable(db, data.COLLECTION_BUYERS)
    if(buyersObject == []):
        return None
    
    # for every buyer, compare buying product with tenants sold items
    for buyer in buyersObject:
        produceList = []
        for produce in sellingObject:
            if produce[0] in buyer['buying']:
                produceList.append(produce[0])
        if(produceList != []):
            buyerList.append([buyer['uname'], produceList])
    return buyerList

def getUserInfo(db, sessionID):
    '''Return user information from the user table and their associated role table, requires sessionID'''
    # from session ID get the users entry
    userObject = data.getTableEntry(db, data.COLLECTION_USERS, { "sessionID": sessionID })
    if(userObject == []):
        return {"status": "unsuccessful"}
    uname = userObject[0]['uname']
    role = userObject[0]['role']
    # get from the associated role table the user data: landowner, tenant, supplier, buyer
    if(role == "tenant"):
        tableData = data.getTableEntry(db, data.COLLECTION_TENANTS, {"uname": uname})
    if(role == "landowner"):
        tableData = data.getTableEntry(db, data.COLLECTION_LANDOWNERS, {"uname": uname})
    if(role == "supplier"):
        tableData = data.getTableEntry(db, data.COLLECTION_SUPPLIERS, {"uname": uname})
    if(role == "buyer"):
        tableData = data.getTableEntry(db, data.COLLECTION_BUYERS, {"uname": uname})
    
    if(tableData == []):
        return {"status": "unsuccessful"}
    
    entriesToRemove = ('_id', 'pwd', 'sessionID')
    for key in entriesToRemove:
        userObject[0].pop(key)
        
    tableData[0].pop('_id')
    return (tableData[0], userObject[0])
    
def generateSessionID():
    '''Returns a random 32 char string for temporary sessionID'''
    return secrets.token_urlsafe(32)

def authSession(db, sessionID):
    '''Used to verify a sessionID is valid, gives user role if sessionID exists'''
    # verify cookie exists on server
    # if exists, return true / else return false
    sessionStatus = data.getSession(db, sessionID)
    returnObject = {}
    if(len(sessionStatus) > 0):
        return {"status": True, "role": sessionStatus[0]['role']}
    else:
        return {"status": False}

def updateSessionID(db, sessionID, username):
    '''Updates the sessionID of a user, happens on login'''
    # send sessionID to update function 
    data.updateSessionID(db, sessionID, username)
    return None 

def getPlotInfo(db, sessionID, landID, plotID):
    '''Returns land, plot and landowner details of associated plots'''
    returnObject = []
    # get current user details, trying to view the plot details
    
    currentUserObject = data.getTableEntry(db, data.COLLECTION_USERS, {"sessionID": sessionID})
    if(currentUserObject == []):
        return {"Status": "Failure: Incorrect sesison ID"}
    currentUserName = currentUserObject[0]['uname']
    
    currentTenantObject = data.getTableEntry(db, data.COLLECTION_TENANTS, {"uname": currentUserName})
    if(currentTenantObject == []):
        return {"Status": "Failure: Not a tenant"}
    
    rentedPlot = False
    for i in currentTenantObject[0]["plots"]:
        if plotID in i:
            rentedPlot = True
            billDate = i[2]
    
    if(rentedPlot):
        print("User registered to plot")
    else:
        return {"Status": "Failure: you don't rent this plot!"}
    
    # get landowner object from landID
    landownerObject = data.getTableEntry(db, data.COLLECTION_LANDOWNERS, {'landIDs': landID})
    # get landowner contact details from uname -> users table
    if(landownerObject == []):
        return None
    landownerContact = data.getTableEntry(db, data.COLLECTION_USERS, {'uname': landownerObject[0]['uname']})
    
    entriesToRemove = ('_id', 'uname', 'pwd', 'role', 'sessionID')
    for key in entriesToRemove:
        landownerContact[0].pop(key)
        
    returnObject.append({"landownerDetails": landownerContact[0]})

    
    landObject = data.getTableEntry(db, data.COLLECTION_LAND, {'landID': landID})
    if(landObject == []):
        return None
    # get landID from landID
    # get Ammenities from landID
    entriesToRemove = ('_id', 'plotIDs')
    for key in entriesToRemove:
        landObject[0].pop(key)
        
    returnObject.append({"landDetails": landObject[0]})

    
    # get plotObject from plotID and landID
    plotObject = data.getTableEntry(db, data.COLLECTION_PLOTS, {'landID': landID, 'plotID': plotID})
    if(plotObject == []):
        return None
    # get friendlyName from plotID
    # get LAT from plotID
    # get LONG from plotID
    
    entriesToRemove = ('_id', 'status', 'landID')
    for key in entriesToRemove:
        plotObject[0].pop(key)
    plotObject[0].update({"billDate": billDate})
    returnObject.append({"plotDetails": plotObject[0]})   
    return returnObject


def updateUserInfo(db, sessionID, req_data):
    '''Updates a user contact info on the db given a valid sessionID and required fields'''
    # extract each element from req_data
    email = req_data['email']
    phoneNo = req_data['phoneNo']
    fName = req_data['fName']
    lName = req_data['lName']
    toUpdate = { "$set": { "email": email, "phoneNo": phoneNo, "fName": fName, "lName": lName} }
    # ensure sessionID is valid
    isValid = data.getTableEntry(db, data.COLLECTION_USERS, {"sessionID": sessionID})
    if(isValid == []):
        return {"Status": "Invalid Session ID!"}
    successStatus = data.updateTableEntry(db, data.COLLECTION_USERS, {"sessionID": sessionID}, toUpdate)
    if(successStatus == None):
        return {"Status": "Failure: Could not update user info"}
    
    return {"Status": "Success"}

def updatePassword(db, req_data):
    '''Update a user password given sessionID, current and new password'''
    sessionID = req_data['sessionID']
    currPwd = req_data['currentPassword']
    newPwd = req_data['newPassword']
    
    userObject = data.getTableEntry(db, data.COLLECTION_USERS, {"sessionID": sessionID})
    if(userObject == []):
        return {"Status": "Failure: Invalid Session ID"}
    
    currPwdHash = data.saltAndHash(currPwd)
    
    if(currPwdHash != userObject[0]['pwd']):
        return {"Status": "Failure: Password Does Not Match Database"}
    
    newPwdHash = data.saltAndHash(newPwd)
    toUpdate = { "$set": { "pwd": newPwdHash} }

    data.updateTableEntry(db, data.COLLECTION_USERS, {"sessionID": sessionID}, toUpdate)
    return {"Status": "Success: Password Updated!"}

def browsePlots(db, req_data):
    '''Returns land and associated plot details given a sessionID and landID'''
    sessionID = req_data['sessionID']
    landID = req_data['landID']
    plotDetails = []
    landDetails = {}
    
    # add related land details
    landObj = data.getTableEntry(db, data.COLLECTION_LAND, {"landID": landID})
    if(landObj == []):
        return {"Status": "Failure: No associated land found for given landID"}
    
   
    landObj[0].pop('_id')
    
    landDetails.update(landObj[0])
    
    plotList = landObj[0].pop('plotIDs')
    # add related plot details
    for plotID in plotList:
        plotObject = data.getTableEntry(db, data.COLLECTION_PLOTS, {"landID": landID, "plotID": plotID})
        
        if(plotObject == []):
            return None
        plotObject[0].pop("_id")
        
        toAdd = plotObject[0]
        plotDetails.append(toAdd)
        
    returnObject = [{"landDetails": landDetails, "plotDetails": plotDetails}]
    
    return returnObject

def getLandEntries(db, req_data):
    '''Given a sessionID, all land entries in land table (for browsing plots)'''
    sessionID = req_data['sessionID']
    
    userObj = data.getTableEntry(db, data.COLLECTION_USERS, {"sessionID": sessionID})
    if(userObj == []):
        return {"Status": "Failure: Invalid sessionID"}
    # user is valid 
    # ignore user object now, get all land entries
    landObjs = data.getAllFromTable(db, data.COLLECTION_LAND)
    
    if(landObjs == []):
        return {"Status": "Failure: Missing land objects"}
        
    for land in landObjs:
        land.pop('amenities')
    return landObjs

def getLandEntriesOp(db, req_data):
    '''Given a sessionID, all land entries in land table (for browsing plots) and their associated plot information'''
    sessionID = req_data['sessionID']
    returnObject = []
    
    userObj = data.getTableEntry(db, data.COLLECTION_USERS, {"sessionID": sessionID})
    if(userObj == []):
        return {"Status": "Failure: Invalid sessionID"}
    # user is valid 
    # ignore user object now, get all land entries
    landObjs = data.getAllFromTable(db, data.COLLECTION_LAND)
    
    if(landObjs == []):
        return {"Status": "Failure: Missing land objects"}
        
    for land in landObjs:
        returnObject.append(browsePlots(db, {"sessionID": sessionID, "landID": land["landID"]})[0])
        
    return returnObject

def addLandEntry(db, req_data):
    '''Adds a land entry and associated plots to the database'''
    
    landID = req_data['landData']['landID']
    landFriendlyName = req_data['landData']['friendlyName']
    plotIDs = req_data['landData']['plotIDs']
    amenities = req_data['landData']['amenities']
    
    # check landID hasn't been taken already
    existingLand = data.getTableEntry(db, data.COLLECTION_LAND, {"landID": landID})
    if(existingLand != []):
        return {"Status": "Failure: LandID already taken"}
    
    # add landID to the landowner table
    sessionID = req_data['sessionID']
    userObject = data.getTableEntry(db, data.COLLECTION_USERS, {"sessionID": sessionID})
    if(userObject == []):
        return {"Status": "Failure: Invalid SessionID"}
    if(userObject[0]["role"] != "landowner"):
        return {"Status": "Failure: User is not a landowner"}
    
    existingLandownerLand = data.getTableEntry(db, data.COLLECTION_LANDOWNERS, {"uname": userObject[0]['uname']})[0]['landIDs']
    existingLandownerLand.append(landID)
    
    attemptedUpdate = data.updateTableEntry(db, data.COLLECTION_LANDOWNERS, {"uname": userObject[0]['uname']}, { "$set": { "landIDs": existingLandownerLand } })
    
    if(attemptedUpdate == None):
        return {"Status": "Failure: Cannot add landID to landowner entry"}
    
    
    # add land data to table entry
    document = {"landID": landID, "friendlyName": landFriendlyName, "plotIDs": plotIDs, "amenities": amenities}
    addedLand = data.createTableEntry(db, data.COLLECTION_LAND, document)
    
    if(addedLand == None):
        return {"Status": "Failure: Cannot add land entry to database"}
    
    for plot in plotIDs:
        # add each plot to the plot table, assuming no duplicate plotIDs in submitted collection
        landID = landID
        status = "Available"
        plotFriendlyName = ""
        plotPrice = req_data['plotData'][plot]['price']
        plotCoords = req_data['plotData'][plot]['coords']
        plotSize = req_data['plotData'][plot]['size']
        
        document = {"landID": landID, "plotID": plot, "status": status, "price": plotPrice, "friendlyName": plotFriendlyName,"waitingList": [], "coords": plotCoords, "size": plotSize}
        
        addedPlot = data.createTableEntry(db, data.COLLECTION_PLOTS, document)
        if(addedPlot == None):
            return {"Status": "Failure: Cannot add plot entry: " + plot + " to database"}
        
    return {"Status": "Success"}

def getLandownerPlots(db, req_data):
    '''Get plots that belong to the user (if a landowner)'''
    returnObj = []
    
    sessionID = req_data['sessionID']
    userObject = data.getTableEntry(db, data.COLLECTION_USERS, {"sessionID": sessionID})
    if(userObject == []):
        return {"Status": "Failure: Invalid sessionID"}
    
    if(userObject[0]['role'] != "landowner"):
        return {"Status": "Failure: Invalid user role"}
    
    landownerObject = data.getTableEntry(db, data.COLLECTION_LANDOWNERS, {"uname": userObject[0]["uname"]})
    
    if(landownerObject == []):
        return {"Status": "Failure: No landowner object"}
    
    for item in landownerObject:
        landIDs = item['landIDs']
        for landID in landIDs:
            plots = data.getTableEntry(db, data.COLLECTION_PLOTS, {"landID": landID})
            for plot in plots:
                returnObj.append({"plotID": plot['plotID'], "landID": plot['landID'], "status": plot['status'], "price": plot['price'], "waitingList": plot['waitingList']})


    return returnObj

def appendWaitingList(db, req_data):
    '''add a tenant to the waiting list of a plot'''
    sessionID = req_data['sessionID']
    plotID = req_data['plotID']
    landID = req_data['landID']
    
    userObject = data.getTableEntry(db, data.COLLECTION_USERS, {"sessionID": sessionID})
    if(userObject == []):
        return {"Status": "Failure: Invalid sessionID"}
    
    if(userObject[0]['role'] != "tenant"):
        return {"Status": "Failure: Invalid user role"}
    
    uname = userObject[0]['uname']
    identifier = {"landID": landID, "plotID": plotID}
    toUpdateObject = data.getTableEntry(db, data.COLLECTION_PLOTS, identifier)
    if(toUpdateObject == []):
        return {"Status": "Failure: Invalid plot identifier data"}
    
    waitingList = toUpdateObject[0]['waitingList']
    
    if(uname in waitingList):
        return {"Status": "You're already in the waiting list!"}
    
    waitingList.append(uname)
    
    documentToUpdate = { "$set": { "waitingList": waitingList } }
    
    status = data.updateTableEntry(db, data.COLLECTION_PLOTS, identifier, documentToUpdate)
    if(status == None):
        return {"Status": "Failure: Could not add to waiting list"}
    else:
        return {"Status": "Success: Added to waiting list"}
    
def approveWaitingList(db, req_data):
    '''approve a tenant to start renting the plot from the waiting list'''
    sessionID = req_data['sessionID']
    
    plotID = req_data['plotID']
    landID = req_data['landID']

    approvedUname = req_data['uname']
    
    userObject = data.getTableEntry(db, data.COLLECTION_USERS, {"sessionID": sessionID})
    if(userObject == []):
        return {"Status": "Failure: Invalid sessionID"}
    
    if(userObject[0]['role'] != "landowner"):
        return {"Status": "Failure: Invalid user role"}
    
    uname = userObject[0]['uname']
#     check land belongs to the user associated with the landID!!
    landownerObject = data.getTableEntry(db, data.COLLECTION_LANDOWNERS, {"uname": uname})
    if(landownerObject == []):
        return {"Status": "Failure: Not a landowner!"}
    
    
    if(landID not in landownerObject[0]['landIDs']):
        return {"Status": "Failure: You dont own the land!"}
    
#     remove user from waiting list

    plotData = data.getTableEntry(db, data.COLLECTION_PLOTS, {"landID": landID, "plotID": plotID})
    if(plotData == []):
        return {"Status": "Failure: Invalid plot data"}
    
    waitingList = plotData[0]['waitingList']
    waitingList.remove(approvedUname)
    plotPrice = plotData[0]['price']
    
#     update new waitingList
    plotUpdate = { "$set": { "waitingList": waitingList, "status": "Unavailable" } }
    
    updatePlotStatus = data.updateTableEntry(db, data.COLLECTION_PLOTS, {"landID": landID, "plotID": plotID}, plotUpdate)
    
    # update tenants table with new plotID
    
    tenantObj = data.getTableEntry(db, data.COLLECTION_TENANTS, {"uname": approvedUname})
    
    if(tenantObj == []):
        return {"Status": "Failure: No tenant object found"}
    
    tenantPlots = tenantObj[0]["plots"]
    tenantBills = tenantObj[0]['totalBillAmt']
    tenantBillDates = tenantObj[0]['billDate']
    
    today = datetime.date.today()
    dateString = str(today.day) + "/" + str(today.month) + "/" + str(today.year)
    billDateString = str(today.day) + "/" + str(today.month)
    
    tenantPlots.append([landID, plotID, dateString])
    tenantBills += int(plotPrice)
    tenantBillDates.append([landID, plotID, billDateString])
    
    tenantIdentifier = {"uname": approvedUname}
    tenantUpdate = { "$set": { "plots": tenantPlots, "totalBillAmt": tenantBills, "billDate": tenantBillDates } }
    
    tenantUpdateStatus = data.updateTableEntry(db, data.COLLECTION_TENANTS, tenantIdentifier, tenantUpdate)
    
    if(tenantUpdateStatus == None):
        return {"Status": "Failure: Tenant table update stopped"}
    else:
        return {"Status": "Should be a success"}
    
    return None

def giveNotice(db, req_data):
    '''Update the tenant entry with a notice field for a specified plot on land'''
    sessionID = req_data['sessionID']
    plotID = req_data['plotID']
    landID = req_data['landID']
    
    userObject = data.getTableEntry(db, data.COLLECTION_USERS, {"sessionID": sessionID})
    
    if(userObject == []):
        return {"Status": "Failure: Invalid sessionID"}
    
    tenancyData = data.getTableEntry(db, data.COLLECTION_TENANTS, {"uname": userObject[0]['uname']})
    
    if(tenancyData == []):
        return {"Status": "Failure: Invalid Tenant"}
    
    # see if plot already notice given
    
    plotNotice = tenancyData[0]['notice']
    
    for notice in plotNotice:
        if(plotID in notice and landID in notice):
            return {"Status": "Plot already noticed"}
    
    date = datetime.date.today()
    date = date + relativedelta(months=+6)
    noticeDateString = date
    
    tenantNotice = tenancyData[0]['notice']
    tenantNotice.append([plotID, landID, str(noticeDateString)])
    
    update = { "$set": { "notice": tenantNotice } }
    
    updateStatus = data.updateTableEntry(db, data.COLLECTION_TENANTS, {"uname": userObject[0]['uname']}, update)
    if(updateStatus == None):
        return {"Status": "Failure: Something went wrong!"}
    else:
        return {"Status": "Success"}

def getWaitingList(db, req_data):
    '''Fetch the waiting list for a plot on land'''
    sessionID = req_data['sessionID']
    landID = req_data['landID']
    plotID = req_data['plotID']
    
    userObject = data.getTableEntry(db, data.COLLECTION_USERS, {"sessionID": sessionID})
    
    if(userObject == []):
        return {"Status": "Failure: Invalid sessionID"}
    
    plotObject = data.getTableEntry(db, data.COLLECTION_PLOTS, {"plotID": plotID, "landID": landID})
    if(plotObject == []):
        return {"Status": "Failure: Invalid plot data"}
    
    return plotObject[0]['waitingList']

def getLandownerLand(db, req_data):
    '''Return the land owned by the user if a landowner'''
    sessionID = req_data['sessionID']
    returnObj = []
    
    userObj = data.getTableEntry(db, data.COLLECTION_USERS, {"sessionID": sessionID})
    if(userObj == []):
        return {"Status": "Failure: Invalid sessionID"}
    # user is valid 

    landownerObject = data.getTableEntry(db, data.COLLECTION_LANDOWNERS, {"uname": userObj[0]['uname']})
    
    if(landownerObject == []):
        return {"Status": "Failure: Invalid landowner"}
    # landowner is valid 
    
    landObjs = data.getAllFromTable(db, data.COLLECTION_LAND)
    
    if(landObjs == []):
        return {"Status": "Failure: Missing land objects"}
        
    for land in landObjs:
        if(land['landID'] in landownerObject[0]['landIDs']):
            land.pop('amenities')
            returnObj.append(land)
            
    return returnObj

def updateBuyerItems(db, req_data):
    '''Updates a buyer entry with a new list of items interested in'''
    sessionID = req_data['sessionID']
    itemNames = req_data['itemList']
    
    userObject = data.getTableEntry(db, data.COLLECTION_USERS, {"sessionID": sessionID})
    if(userObject == []):
        return {"Status": "Failure: Invalid sessionID"}
    # user is valid 
    
    if(userObject[0]['role'] != "buyer"):
        return {"Status": "Failure: Not a buyer"}
    
    uname = userObject[0]['uname']
    
    buyerObject = data.getTableEntry(db, data.COLLECTION_BUYERS, {"uname": uname})
    
    # update buying items entry with new array from req_data
    
    toUpdate = { "$set": { "buying": itemNames } }
    
    updateStatus = data.updateTableEntry(db, data.COLLECTION_BUYERS, {"uname": uname}, toUpdate)
    
    if(updateStatus == None):
        return{"Status": "Failure: Could not update table entry for buyer"}
    else:
        return{"Status": "Success: Replaced buying list with new values"}

def getPlotDetails(db, req_data):
    '''Returns a detailed object of land and plot information as well as tenant information if rented'''
    sessionID = req_data['sessionID']
    landID = req_data['landID']
    plotID = req_data['plotID']
    
    returnObject = {}
    
    userObject = data.getTableEntry(db, data.COLLECTION_USERS, {"sessionID": sessionID})
    if(userObject == []):
        return {"Status": "Failure: Invalid sessionID"}
    
    landownerObject = data.getTableEntry(db, data.COLLECTION_LANDOWNERS, {"uname": userObject[0]['uname']})
    if(landownerObject == []):
        return {"Status": "Failure: Invalid account type"}
    
    landObject = data.getTableEntry(db, data.COLLECTION_LAND, {"landID": landID})
    if(landObject == []):
        return {"Status": "Failure: Invalid landID"}
    
    plotData = data.getTableEntry(db, data.COLLECTION_PLOTS, {"landID": landID, "plotID": plotID})
    if(landObject == []):
        return {"Status": "Failure: Invalid plot data"}
    
    allTenants = data.getAllFromTable(db, data.COLLECTION_TENANTS) # NEEDS WORKING AROUND, THIS WILL BE SLOWER OVER TIME
    
    rentedBy = ""

    for entry in allTenants:
        for plots in entry['plots']:
            if(landID in plots and plotID in plots):
                rentedBy = entry['uname']
                
                
    rentedUserObject = data.getTableEntry(db, data.COLLECTION_USERS, {"uname": rentedBy})
    if(rentedUserObject != []):
        # not rented by anyone
        returnObject.update({"tenantData": {"fName": rentedUserObject[0]['fName'],"lName": rentedUserObject[0]['lName'], "email": rentedUserObject[0]['email'],"phoneNo": rentedUserObject[0]['phoneNo']}})
    else:
        print("Not rented by anyone")
        returnObject.update({"tenantData":""})
    
    returnObject.update({"plotData": {"plotID": plotData[0]['plotID'],"price": plotData[0]['price'], "waitingList": plotData[0]['waitingList'], "coords": plotData[0]['coords']}})
    
    returnObject.update({"landData": {"amenities": landObject[0]['amenities']}})
    
    return returnObject

def updatePlotData(db, req_data):
    '''Updates friendlyName and produce on the tenant table in database'''
    return req_data

def updateTenantItems(db, req_data):
    '''Updates the tenants produce entry on their specific plot'''
    sessionID = req_data['sessionID']
    plotID = req_data['plotID']
    landID = req_data['landID']
    produceArray = req_data['produce']
    
    ### verification
    # verify user exists
    userObject = data.getTableEntry(db, data.COLLECTION_USERS, {"sessionID": sessionID})
    if(userObject == []):
        return {"Status": "Failure: Invalid sessionID"} 
    # verify they are a tenant
    if(userObject[0]['role'] != 'tenant'):
        return {"Status": "Failure: Invalid user type"} 
    # verify they rent the plot
    tenantObject = data.getTableEntry(db, data.COLLECTION_TENANTS, {"uname": userObject[0]['uname']})
    if(tenantObject == []):
        return {"Status": "Failure: Invalid tenant data"}
    
    
    ### update produce with [[item, landID, plotID]]
    # get produce field
    tenantProduce = tenantObject[0]['produce']
    sendBack = []
    # for every entry, remove ones that match entry[1] == landID && entry[2] == plotID
    for entry in tenantProduce:
        print("LOOKING AT\n", entry)
        if(entry[1] == landID and entry[2] == plotID):
            print("Ignoring this item: ", entry)
        else:
            sendBack.append(entry)
            
    # for every element in produceArray, append produce field with [element, landID, plotID]
    for produce in produceArray:
        sendBack.append([produce, landID, plotID])
        print("ADDING ", produce)
    
    toUpdate = { "$set": { "produce": sendBack } }
    updateStatus = data.updateTableEntry(db, data.COLLECTION_TENANTS, {"uname": userObject[0]['uname']}, toUpdate)
    
    if(updateStatus == None):
        return {"Status": "Failure: Could not add to table"}
    
    return {"Status": "Success: Added to table"}

def getBuyerContact(db, req_data):
    sessionID = req_data['sessionID']
    buyerName = req_data['username']
    
    ### verification
    # verify user exists
    userObject = data.getTableEntry(db, data.COLLECTION_USERS, {"sessionID": sessionID})
    if(userObject == []):
        return {"Status": "Failure: Invalid sessionID"} 
    # verify they are a tenant
    if(userObject[0]['role'] != 'tenant'):
        return {"Status": "Failure: Invalid user type"} 
    
    buyerObject = data.getTableEntry(db, data.COLLECTION_USERS, {"uname": buyerName})
    if(buyerObject == []):
        return {"Status": "Failure: Invalid buyer"} 
    
    return {"phoneNo": buyerObject[0]['phoneNo'], "email": buyerObject[0]['email']}

def updateSupplierItems(db, req_data):
    '''Updates a supplier entry with a new list of items selling'''
    sessionID = req_data['sessionID']
    itemNames = req_data['itemList']
    
    print(itemNames)
    
    userObject = data.getTableEntry(db, data.COLLECTION_USERS, {"sessionID": sessionID})
    if(userObject == []):
        return {"Status": "Failure: Invalid sessionID"}
    # user is valid 
    
    if(userObject[0]['role'] != "supplier"):
        return {"Status": "Failure: Not a supplier"}
    
    uname = userObject[0]['uname']
    
    supplierObject = data.getTableEntry(db, data.COLLECTION_SUPPLIERS, {"uname": uname})
    
    # update buying items entry with new array from req_data
    
    toUpdate = { "$set": { "selling": itemNames } }
    
    updateStatus = data.updateTableEntry(db, data.COLLECTION_SUPPLIERS, {"uname": uname}, toUpdate)
    
    if(updateStatus == None):
        return{"Status": "Failure: Could not update table entry for buyer"}
    else:
        return{"Status": "Success: Replaced buying list with new values"}
    
def getInterestedSuppliers(db, req_data):
    '''Gets supplier entries'''
    sessionID = req_data['sessionID']
        
    userObject = data.getTableEntry(db, data.COLLECTION_USERS, {"sessionID": sessionID})
    if(userObject == []):
        return {"Status": "Failure: Invalid sessionID"}
    # user is valid 
    
    if(userObject[0]['role'] != "landowner"):
        return {"Status": "Failure: Not a landowner"}
    
    
    suppliersObject = data.getAllFromTable(db, data.COLLECTION_SUPPLIERS)
    
    # update buying items entry with new array from req_data
    
    toReturn = []
    
    for item in suppliersObject:
        toReturn.append(item)
        
    return toReturn

def showSupplierInfo(db, req_data):
    sessionID = req_data['sessionID']
    supplierName = req_data['username']

    ### verification
    # verify user exists
    userObject = data.getTableEntry(db, data.COLLECTION_USERS, {"sessionID": sessionID})
    if(userObject == []):
        return {"Status": "Failure: Invalid sessionID"} 
    # verify they are a landowner
    if(userObject[0]['role'] != 'landowner'):
        return {"Status": "Failure: Invalid user type"} 

    supplierObject = data.getTableEntry(db, data.COLLECTION_USERS, {"uname": supplierName})
    if(supplierObject == []):
        return {"Status": "Failure: Invalid buyer"} 

    return {"phoneNo": supplierObject[0]['phoneNo'], "email": supplierObject[0]['email']}

def updatePlotBill(db, req_data):
    sessionID = req_data['sessionID']
    billAmt = req_data['bill']
    landID = req_data['landID']
    plotID = req_data['plotID']

    ### verification
    # verify user exists
    userObject = data.getTableEntry(db, data.COLLECTION_USERS, {"sessionID": sessionID})
    if(userObject == []):
        return {"Status": "Failure: Invalid sessionID"} 
    # verify they are a landowner
    if(userObject[0]['role'] != 'landowner'):
        return {"Status": "Failure: Invalid user type"} 
    
    # get the specific plot info
    plotEntry = data.getTableEntry(db, data.COLLECTION_PLOTS, {"landID": landID, "plotID": plotID})
    
    if(plotEntry == []):
        return {"Status": "Failure: Invalid Plot Data"} 
    
    toUpdate = { "$set": { "price": billAmt } } 
    
    updateStatus = data.updateTableEntry(db, data.COLLECTION_PLOTS, {"landID": landID, "plotID": plotID}, toUpdate)
    
    if(updateStatus == None):
        return {"Status": "Failure: Could not update db"} 
    
    return {"Status": "Success: Updated DB"} 

def getLandownerContact(db, req_data):
    sessionID = req_data['sessionID']
    landID = req_data['landID']
    
    ### verification
    # verify user exists
    userObject = data.getTableEntry(db, data.COLLECTION_USERS, {"sessionID": sessionID})
    if(userObject == []):
        return {"Status": "Failure: Invalid sessionID"} 
    # verify they are a tenant
    if(userObject[0]['role'] != 'tenant'):
        return {"Status": "Failure: Invalid user type"} 
    
    # get all landowners
    
    landowners = data.getAllFromTable(db, data.COLLECTION_LANDOWNERS)
    
    if(landowners == []):
        return {"Status": "Failure"}
    
    for entry in landowners:
        if(landID in entry["landIDs"]):
            # get contact from uname of landowner
            uname = entry['uname']
            returnObj = data.getTableEntry(db, data.COLLECTION_USERS, {"uname": uname})
            return {"phone": returnObj[0]['phoneNo'], "email": returnObj[0]['email']}
        
    return {"Status": "Failure"}

def checkPlotNotice(db, req_data):
    sessionID = req_data['sessionID']
    plotID = req_data['plotID']
    landID = req_data['landID']
    
    userObject = data.getTableEntry(db, data.COLLECTION_USERS, {"sessionID": sessionID})
    
    if(userObject == []):
        return {"Status": "Failure: Invalid sessionID"}
    
    tenancyData = data.getTableEntry(db, data.COLLECTION_TENANTS, {"uname": userObject[0]['uname']})
    
    if(tenancyData == []):
        return {"Status": "Failure: Invalid Tenant"}
    
    # see if plot already notice given
    
    plotNotice = tenancyData[0]['notice']
    
    for notice in plotNotice:
        if(plotID in notice and landID in notice):
            return {"Notice": "True"}
        
    return {"Notice": "False"}