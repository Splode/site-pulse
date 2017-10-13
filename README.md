# Site Status Check Tool

> Check the status of web properties and receive notifications on unhealthy sites

## Installation

The Site Status Check Tool requires **Node.js v6+**. For instructions on installing Node, visit [https://nodejs.org/en/]('https://nodejs.org/en/').

With Node.js v6+ installed, install project dependencies with the following command:

```bash
npm i
```

## Usage

### Configuration

#### Application Options

The application can be configured by editing the `config.json` file.

##### Editing Sites
To add or remove a site, simply provide an http url and a name for the log file to be created.

#### Email Authentication

The application uses an `auth.json` file to populate the credentials required for email service.

*Note: the `auth.json` file is not included in the project repo for security purposes.*

To run the application, you must provide an `auth.json` file located in the project root, with the following format:

```json
{
  "user": "email address",
  "pass": "password",
  "host": "host server",
  "port": "port number",
  "secure": true
}
```

The `"secure"` field is a boolean, which should be set to `true` for SSL connections and set to `false` for TSL connections.

### Running the Application

Start the application with the following command:

```bash
npm start
```

To cancel the process, press `ctrl+c`.