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
    └── config.py                            # coonfiguration like security keys etc
├── frontend/
    ├── components/              # all reuseable components (navbar, card etc). By convention all comp are capitalized
        ├── Navbar.js
    ├── pages/                   # all pages, single usage components kept seperate    
        ├── LoginPage.js 
        ├── RegisterPage.js            
    ├── utils
        ├── router.js           # handling what to show
    ├── app.js
    └── index.html              # single html file, everything will be done using Vue
├── instance/
    └── database.sqlite3
├── app.py          # will create db automatically, importing both model files
└── README.md
 ```
