from application import create_app
import os

app = create_app()

if __name__ == "__main__":
    if os.environ.get('AZURE_POSTGRESQL_CONNECTIONSTRING'):
        # Production
        print('Running app in production mode.')
        app.run()

    else:
        # Development
        print('Running app in development mode.')
        ssl_context = ('ssl_context/cert.pem', 'ssl_context/key.pem')
        print(f"SSL context: {ssl_context}")
        app.run(ssl_context=ssl_context, port=5001)
