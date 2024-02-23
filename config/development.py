import os

# DATABASE_URI = 'postgresql+psycopg2://{dbuser}:{dbpass}@{dbhost}:{dbport}/{dbname}'.format(
#     dbuser=os.environ.get('DBUSER'),
#     dbpass=os.environ.get('DBPASS'),
#     dbhost=os.environ.get('DBHOST'),
#     dbport=os.environ.get('DBPORT'),
#     dbname=os.environ.get('DBNAME')
# )

DATABASE_URI = 'dbname={dbname} user={dbuser} password={dbpass} host={dbhost} port={dbport}'.format(
    dbuser=os.environ.get('DBUSER'),
    dbpass=os.environ.get('DBPASS'),
    dbhost=os.environ.get('DBHOST'),
    dbport=os.environ.get('DBPORT'),
    dbname=os.environ.get('DBNAME')
)

SECRET_KEY=os.environ.get('SECRET_KEY')

DEBUG=os.environ.get('FLASK_DEBUG', False)
