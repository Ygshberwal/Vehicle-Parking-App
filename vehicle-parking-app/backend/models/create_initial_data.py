from backend.models.models import db, User

if not User.query.filter_by(role="admin").first():
    admin= User(
        username = "admin",
        email = "admin@parking.com",
        password = "admin123",    #will focus on hashing later
        role = "admin"
    )

    db.session.add(admin)
    db.session.commit()
    print("Admin created successfully\nusername: admin@parking.com\npass: admin123")
else :
    print("Admin already exists")