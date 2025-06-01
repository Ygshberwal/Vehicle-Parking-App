### How to run the app
```bash
python3 -m venv .parking
source parking/bin/activate
cd vehicle-parking-app
python3 app.py
```


### Folder Structure & File Description 
```bash
vehicle-parking-app/
├── backend/
    ├── models/
        ├── create_initial_database.py       # initialise database with admin data
        ├── models.py                        # for creating the database
    ├── routes.py                            # backend logic for end points
    ├── resources.py                         # flask-restful for handling api
    └── config.py                            # coonfiguration like security keys etc
├── frontend/
    ├── components/              # all reuseable components (navbar, card etc). By convention all comp are capitalized
        ├── Navbar.js
        ├── LotCard.js
    ├── pages/                   # all pages, single usage components kept seperate    
        ├── LoginPage.js 
        ├── RegisterPage.js            
        ├── LotListPage.js            
    ├── utils
        ├── router.js           # handling what to show
        ├── store.js            # for storing and sharing data between components using vuex
    ├── app.js
    └── index.html              # single html file, everything will be done using Vue
├── instance/
    └── database.sqlite3
├── app.py          # will create db automatically, importing both model files
└── README.md
 ```
