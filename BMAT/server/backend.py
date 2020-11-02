from flask import Flask, request, jsonify
from flask_cors import CORS
import json, os, sys, threading, stripe

app = Flask(__name__)
CORS(app)

@app.route('/api/<exam>/request_questionbanks', methods=['GET', 'POST'])
def request_questionbanks(exam):
    questionbank_path = os.path.join(app.root_path, exam + '_data/questionbanks.json') 
    with open(questionbank_path, encoding = "utf8") as f:
        response = json.load(f)   
    return response

@app.route('/api/<exam>/request_examdata/<questionbank_name>', methods=['GET', 'POST'])
def request_examdata(exam, questionbank_name):
    print(questionbank_name)
    questionbank_path = os.path.join(app.root_path, exam + '_data/examdata ' + questionbank_name + '.json') 
    with open(questionbank_path, encoding = "utf8") as f:
        response = json.load(f)   
    return response

@app.route('/api/<exam>/check_login', methods=['GET', 'POST'])
def check_login(exam):
    login_details = request.get_json(force=True)
    usernamedata = login_details['username']
    value = CheckUserExists(usernamedata, exam)

    return jsonify(
        valid_email = value
    )


def CheckStripeCustomers():
    print('Checking stripe...')
    stripe.api_key = ""

    UCAT_Package1 = 'Charge for Pre-interview Dental Applicant Preparation Package -Basic'
    UCAT_Package2 = 'Charge for Pre-interview Dental Applicant Preparation Package - Advanced [BEST SELLER]'
    UCAT_BMAT_Package1 = 'Charge for Pre-interview Dental Applicant Preparation Package - Intermediate'
    UCAT_BMAT_Package2 = 'Charge for Pre-interview Dental Applicant Preparation Package - Comprehensive'

    EmailsToBeAppended_UCAT = [] #Make two different files - one BMAT logins, one UCAT logins - check both
    EmailsToBeAppended_BMAT = []

    CustomerList = stripe.Customer.list()
    x = 0
    for Customer in CustomerList.auto_paging_iter():
        ChargesList = stripe.Charge.list(customer = Customer['id'])
        for Charge in ChargesList.auto_paging_iter():
            if Charge['status'] == 'succeeded':
                if Charge['description'] == UCAT_Package1:
                    EmailsToBeAppended_UCAT.append(Customer['email'].lower())
                    print(Customer['email'] + '\nUCAT Order')
                    print('Charge - ' + Charge['status'])
                
                elif Charge['description'] == UCAT_Package2:
                    EmailsToBeAppended_UCAT.append(Customer['email'].lower())
                    print(Customer['email'] + '\nUCAT Order')
                    print('Charge - ' + Charge['status'])
                
                elif Charge['description'] == UCAT_BMAT_Package1:
                    EmailsToBeAppended_BMAT.append(Customer['email'].lower())
                    EmailsToBeAppended_UCAT.append(Customer['email'].lower())
                    print(Customer['email'] + '\nUCAT & BMAT Order')
                    print('Charge - ' + Charge['status'])

                elif Charge['description'] == UCAT_BMAT_Package2:
                    EmailsToBeAppended_BMAT.append(Customer['email'].lower())
                    EmailsToBeAppended_UCAT.append(Customer['email'].lower())
                    print(Customer['email'] + '\nUCAT & BMAT Order')
                    print('Charge - ' + Charge['status'])

        InvoiceList = stripe.Invoice.list(customer = Customer['id'])
        for Invoice in InvoiceList.auto_paging_iter():
            if Invoice['lines']['data'][0]['description'] == UCAT_Package1:
                EmailsToBeAppended_UCAT.append(Customer['email'].lower())
                print(Customer['email'] + '\nUCAT Invoice')
                
            elif Invoice['lines']['data'][0]['description'] == UCAT_Package2:
                EmailsToBeAppended_UCAT.append(Customer['email'].lower())
                print(Customer['email'] + '\nUCAT Invoice')
                
            elif Invoice['lines']['data'][0]['description'] == UCAT_BMAT_Package1:
                EmailsToBeAppended_BMAT.append(Customer['email'].lower())
                EmailsToBeAppended_UCAT.append(Customer['email'].lower())
                print(Customer['email'] + '\nUCAT & BMAT Invoice')

            elif Invoice['lines']['data'][0]['description'] == UCAT_BMAT_Package2:
                EmailsToBeAppended_BMAT.append(Customer['email'].lower())
                EmailsToBeAppended_UCAT.append(Customer['email'].lower())
                print(Customer['email'] + '\nUCAT & BMAT Invoice')

    EmailsToBeAppended_BMAT.append('developer_test@iwanttobeadentist.com')
    print('UCAT')
    print(EmailsToBeAppended_UCAT)
    print('BMAT')
    print(EmailsToBeAppended_BMAT)
    WriteToUsersFile(EmailsToBeAppended_UCAT, 'UCAT')
    WriteToUsersFile(EmailsToBeAppended_BMAT, 'BMAT')

    threading.Timer(180, CheckStripeCustomers).start()
    print("Scrape timer activating")

def WriteToUsersFile(ListOfUsers, FileName):
    ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
    userfile_path = os.path.join(ROOT_DIR, FileName + '_data/' + FileName + 'users.txt') 
    print(userfile_path)
    CheckIfFilePathExists(userfile_path)

    with open(userfile_path, 'w') as out:
        for item in ListOfUsers:
            out.write(item + '\n')
            print(item)


def CheckIfFilePathExists(filepath):
    FileExists = os.path.isfile(filepath)
    if (FileExists == False):
        print('Using Write Method: Overwriting current directory...')
        FileList = open(filepath, 'w')
        FileList.close()

def CheckUserExists(User, exam):
    #Open User.txt file, check user against file to see if they exist return True/False
    ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
    userfile_path = os.path.join(ROOT_DIR, exam + '_data/' + exam + 'users.txt') #Need to change this to check UCAT AND BMAT
    with open(userfile_path, encoding = "utf8") as f:
        users = f.read().splitlines()
    
    print(exam + ' users:')
    print(users)

    if User.lower() in users:
        print('USER PRESENT')
        return True
    else:
        print('USER NOT PRESENT')
        return False


def ExceptionInfo():
    exc_type, exc_obj, exc_tb = sys.exc_info()
    fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
    print(exc_type, fname, exc_tb.tb_lineno)

if __name__ == '__main__':
    app.run(host='0.0.0.0')


CheckStripeCustomers()

#Functions:
#Request QuestionBanks - 
#   Output - Returns a list of the names of question banks (JSON)
#   This is retrieved from a TXT file called QuestionBank

#Request Questions - 
#   Input - QuestionBank name
#   Output - Returns data to be loaded into the 'exam' data type. (JSON)
#   Retrieved from a TXT file that has the question bank's name

#Login
#   Checks provided credentials against database
#   Returns Valid/Invalid

#Forgotten Password - Could actually avoid resetting password by sending randomised PW
#   Input - email address
#   Output - Email with unique token, when clicked takes to page to reset password

#UpdateDatabase
#   Checks Squarespace commerce DB for any changes every 2 minutes

#SendNewUserEmail
#   If there's a change in the DB w/ new user added, email is sent w/ randomised password

#How the passwords are stored:
#   Email:Password:Package
