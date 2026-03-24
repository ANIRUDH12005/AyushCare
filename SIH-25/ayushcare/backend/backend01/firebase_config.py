# import firebase_admin
# from firebase_admin import credentials

# cred = credentials.Certificate("backend/backend01/firebase_key.json")
# firebase_admin.initialize_app(cred)


# import firebase_admin
# from firebase_admin import credentials

# cred = credentials.Certificate(
#     "D:/code related/code practice/projects/ayushcare/ayushcare/backend/backend01/firebase_key.json"
# )
# firebase_admin.initialize_app(cred)


import os
import firebase_admin
from firebase_admin import credentials

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

cred = credentials.Certificate(
    os.path.join(BASE_DIR, "firebase_key.json")
)

firebase_admin.initialize_app(cred)
