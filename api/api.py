import sys
from flask import Flask, request
from flask_restful import Resource, Api
from json import dumps
from flask_jsonpify import jsonify
from flask_cors import CORS

from utils import data
from utils import controller

# Replace string with link to MongoDB Atlas endpoint
MONGO_DB = "mongodb+srv://admin:microfarms@microfarmscluster1-y0eiq.mongodb.net/test?retryWrites=true&w=majority"

# Attempt connection to MongoDB Atlas DB
db = data.connect(MONGO_DB)
if not db:
    sys.exit()

def writeIp(request):
    req = request.remote_addr
    with open("./ipLog", "a") as myfile:
        try:
            myfile.write(req + "\n" + request.get_json() + "\n\n\n")
        except:
            myfile.write(req + "\n")
        
    
# API ROUTE DEFINITIONS 
class Test(Resource):
    def get(self):
        writeIp(request)
        # test class and function to ensure API is up
        response = controller.test()
        return jsonify(response)

class GetUser(Resource):
    def post(self):
        writeIp(request)
        response = controller.getUser(db, request.form['username'])
        return response

class AddUser(Resource):
    def get(self):
        writeIp(request)
        # hash the given plaintext password
        username = request.args.get('username')
        password = request.args.get('password')
        role = request.args.get('role')
        email = request.args.get('email')
        phoneNo = request.args.get('phone')
        passwordHash = data.saltAndHash(password)
        # pass variables to the auuUser function - connecting to DB
        response = controller.addUser(db, username, passwordHash, role, email, phoneNo)
        # return true / false to the client to indicate success/failure
        return response
    
class AuthUser(Resource):
    def post(self):
        writeIp(request)
        # combine plaintext password with the salt for comparison
        password = data.saltAndHash(request.form['password'])
        # return True / False based on hash and uname matching stored / if found
        response = controller.authUser(db, request.form['username'], password)
        # return True / False to client - might have to return other details (tbc)
        return response
        
class LoginAuth(Resource):
    def get(self):
        writeIp(request)
        username = request.args.get('username')
        password = request.args.get('password')
        # combine plaintext password with the salt for comparison
        hashedPassword = data.saltAndHash(password)
        # return True / False based on hash and uname matching stored / if found
        response = controller.authUser(db, username, hashedPassword)
        # return True / False to client - might have to return other details (tbc)
        if(response == False):
            sessionID = None
        else:
            sessionID = controller.generateSessionID()
            controller.updateSessionID(db, sessionID, username)
        return { 'status': response, 'sessionID': sessionID }

class AuthSession(Resource):
    def get(self):
        writeIp(request)
        sessionID = request.args.get('sessionID')
        # gets session ID if present
        response = controller.authSession(db, sessionID)
        # return True / False to client - might have to return other details (tbc)
        if(response['status'] == False):
            return {'status': 'unauthed'}
        else:
            return {'status': 'authed', "role": response['role']}#, 'details': response}

class GetPlots(Resource):
    def post(self):
        writeIp(request)
        req_data = request.get_json()
        sessionID = req_data['sessionID']
        response = controller.getPlots(db, sessionID)
        
        return jsonify(response)

class GetTenantBills(Resource):
    def post(self):
        writeIp(request)
        req_data = request.get_json()
        sessionID = req_data['sessionID']
        response = controller.getBills(db, sessionID)
        return jsonify(response)
    
class GetInterestedBuyers(Resource):
    def post(self):
        writeIp(request)
        req_data = request.get_json()
        sessionID = req_data['sessionID']
        response = controller.getInterestedBuyers(db, sessionID)
        return jsonify(response)

class GetUserInfo(Resource):
    def post(self):
        writeIp(request)
        req_data = request.get_json()
        sessionID = req_data['sessionID']
        response = controller.getUserInfo(db, sessionID)
        return jsonify(response)
    
class GetPlotInfo(Resource):
    def post(self):
        writeIp(request)
        req_data = request.get_json()
        sessionID = req_data['sessionID']
        landID = req_data['landId']
        plotID = req_data['plotId']
        response = controller.getPlotInfo(db, sessionID, landID, plotID)
        
        return jsonify(response)
    
class UpdateUserInfo(Resource):
    def post(self):
        writeIp(request)
        req_data = request.get_json()
        sessionID = req_data['sessionID']
        response = controller.updateUserInfo(db, sessionID, req_data)
        
        return jsonify(response)
    
class UpdatePassword(Resource):
    def post(self):
        writeIp(request)
        req_data = request.get_json()
        response = controller.updatePassword(db, req_data)
        
        return jsonify(response)
    
class AddLandEntry(Resource):
    def post(self):
        writeIp(request)
        req_data = request.get_json()
        response = controller.addLandEntry(db, req_data)
        return response
        
class BrowsePlots(Resource):
    def post(self):
        writeIp(request)
        req_data = request.get_json()
        response = controller.browsePlots(db, req_data)
        return response
        
class GetLandEntries(Resource):
    def post(self):
        writeIp(request)
        req_data = request.get_json()
        response = controller.getLandEntries(db, req_data)
        return response
    
class GetLandownerPlots(Resource):
    def post(self):
        writeIp(request)
        req_data = request.get_json()
        response = controller.getLandownerPlots(db, req_data)
        return response

class AppendWaitingList(Resource):
    def post(self):
        writeIp(request)
        req_data = request.get_json()
        response = controller.appendWaitingList(db, req_data)
        return response

class ApproveWaitingList(Resource):
    def post(self):
        writeIp(request)
        req_data = request.get_json()
        response = controller.approveWaitingList(db, req_data)
        return response
    
class GiveNotice(Resource):
     def post(self):
        writeIp(request)
        req_data = request.get_json()
        response = controller.giveNotice(db, req_data)
        return response

class GetWaitingList(Resource):
     def post(self):
        writeIp(request)
        req_data = request.get_json()
        response = controller.getWaitingList(db, req_data)
        return response

class GetLandownerLand(Resource):
     def post(self):
        writeIp(request)
        req_data = request.get_json()
        response = controller.getLandownerLand(db, req_data)
        return response
    
class UpdateBuyerItems(Resource):
     def post(self):
        writeIp(request)
        req_data = request.get_json()
        response = controller.updateBuyerItems(db, req_data)
        return response   
    
class GetPlotDetails(Resource):
     def post(self):
        writeIp(request)
        req_data = request.get_json()
        response = controller.getPlotDetails(db, req_data)
        return response 
    
class GetLandEntriesOp(Resource):
     def post(self):
        writeIp(request)
        req_data = request.get_json()
        response = controller.getLandEntriesOp(db, req_data)
        return response 
    
class UpdatePlotData(Resource):
    def post(self):
        writeIp(request)
        req_data = request.get_json()
        response = controller.updatePlotData(db, req_data)
        return response
    
class UpdateTenantItems(Resource):
    def post(self):
        writeIp(request)
        req_data = request.get_json()
        response = controller.updateTenantItems(db, req_data)
        return response
    
class GetBuyerContact(Resource):
    def post(self):
        writeIp(request)
        req_data = request.get_json()
        response = controller.getBuyerContact(db, req_data)
        return response
    
class UpdateSupplierItems(Resource):
     def post(self):
        writeIp(request)
        req_data = request.get_json()
        response = controller.updateSupplierItems(db, req_data)
        return response   
    
class GetInterestedSuppliers(Resource):
     def post(self):
        writeIp(request)
        req_data = request.get_json()
        response = controller.getInterestedSuppliers(db, req_data)
        return response  
    
class ShowSupplierInfo(Resource):
    def post(self):
        writeIp(request)
        req_data = request.get_json()
        response = controller.showSupplierInfo(db, req_data)
        return response  

class UpdatePlotBill(Resource):
    def post(self):
        writeIp(request)
        req_data = request.get_json()
        response = controller.updatePlotBill(db, req_data)
        return response  
    
class GetLandownerContact(Resource):
    def post(self):
        writeIp(request)
        req_data = request.get_json()
        response = controller.getLandownerContact(db, req_data)
        return response     
    
class CheckPlotNotice(Resource):
    def post(self):
        writeIp(request)
        req_data = request.get_json()
        response = controller.checkPlotNotice(db, req_data)
        return response   
    

# FLASK CONFIG 
app = Flask(__name__)
CORS(app)
api = Api(app)

# API ROUTE DECLARATIONS 
api.add_resource(Test, '/api/test') 
api.add_resource(GetUser, '/api/getUser/') # gets user based on uname
api.add_resource(AddUser, '/api/addUser/') # adds user to mongo db
api.add_resource(AuthUser, '/api/auth/') # returns True if a user is found and password hash matches, returns False otherwise
api.add_resource(LoginAuth, '/api/loginAuth/') # checks if user exists and passwordhash matches, if true, generates and sets a sessionID on the database, returns the value to the client, otherwise returns None
api.add_resource(AuthSession, '/api/authSession/') # checks if sessionID is present on the server, only returns true / false
api.add_resource(GetPlots, '/api/getPlots') # returns the basic plot information (plots assigned to user) to the client if session matches tenant user
api.add_resource(GetTenantBills, '/api/getTenantBills') # returns the totalBillAmt value if client sessionID matches tenant user
api.add_resource(GetInterestedBuyers, '/api/getInterestedBuyers') # returns a json array of buyers and what they want to buy from a tenants produce selection
api.add_resource(GetUserInfo, '/api/getUserInfo') # returns all associated user information (regardless of role, will search related table)
api.add_resource(UpdateUserInfo, '/api/updateUserInfo') # sends update to the user table with select user's new details to update
api.add_resource(UpdatePassword, '/api/updatePassword') # verify user authenticity and update password
api.add_resource(GetLandEntries, '/api/getLandEntries') # gets all of the landIDs and friendlyName from the land table, given a sessionID is valid
api.add_resource(BrowsePlots, '/api/browsePlots') # returns plot information for every plot in a land table entry
api.add_resource(GetPlotInfo, '/api/getPlotInfo') # gets relevant plot information (who owns the land + contact)(land amenities + ID)(plotID, friendlyName, COORDS)

api.add_resource(AddLandEntry, '/api/addLandEntry') # adds an entry to the COLLECTION_LAND table on the database
api.add_resource(GetLandownerPlots, '/api/getLandownerPlots') # return array of plots
api.add_resource(AppendWaitingList, '/api/appendWaitingList') # add a user to a waiting list of a plot
api.add_resource(ApproveWaitingList, '/api/approveWaitingList') # landowner approves a user in the waiting list, assigns them a plot
api.add_resource(GiveNotice, '/api/giveNotice') # give plot notice (tenant perspective)
api.add_resource(GetWaitingList, '/api/getWaitingList') # get plot waiting list from a specific plot
api.add_resource(GetLandownerLand, '/api/getLandownerLand') # get the land details of the landowner
api.add_resource(UpdateBuyerItems, '/api/updateBuyerItems') # update buying items from buyer 
api.add_resource(GetPlotDetails, '/api/getPlotDetails') # get plot details- who's renting (+ contact details), waitingList, price, amenities, plot location, (landowner only)
api.add_resource(GetLandEntriesOp, '/api/getLandEntriesOp') # powered up version of getLandEntries that also gets all plot data per land

api.add_resource(UpdatePlotData, '/api/addPlotData') # adding a friendly name and produce to a plot
api.add_resource(UpdateTenantItems, '/api/updateTenantItems') # update produce items from buyer 
api.add_resource(GetBuyerContact, '/api/getBuyerContact') # get contact info of a buyer

api.add_resource(UpdateSupplierItems, '/api/updateSupplierItems') # updates the supplier table entry

api.add_resource(GetInterestedSuppliers, '/api/getInterestedSuppliers')
api.add_resource(ShowSupplierInfo, '/api/showSupplierInfo')

api.add_resource(UpdatePlotBill, '/api/updatePlotBill')
api.add_resource(GetLandownerContact, '/api/getLandownerContact')
api.add_resource(CheckPlotNotice, '/api/checkPlotNotice')


# remove tenant from plot (end of expire period) - probably will run a base function on day start ?

if __name__ == '__main__':
    app.run(host='0.0.0.0', port='5001', threaded=True)