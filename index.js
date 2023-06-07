const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');
require('dotenv').config();

class DatabaseBackup {
    constructor() {
        this.mysqlConfig = {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE
        };
        this.backupCommand = `mysqldump --no-defaults -h ${this.mysqlConfig.host} -u ${this.mysqlConfig.user} -p"${this.mysqlConfig.password}" ${this.mysqlConfig.database}`;
        this.backupFolder = path.join(__dirname, 'backups'); // Backup folder path
    }

    formatTimestamp(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear());
        const hour = String(date.getHours()).padStart(2, '0');
        const minute = String(date.getMinutes()).padStart(2, '0');

        return `backup_${day}-${month}-${year}_${hour}-${minute}`;
    }

    backupDatabase() {
        exec(this.backupCommand, (error, stdout) => {
            if (error) {
                console.log('Backup error:', error);
                return;
            }

            const timestamp = this.formatTimestamp(new Date());
            const backupFileName = `${timestamp}.sql`;
            const backupFilePath = path.join(this.backupFolder, backupFileName); // Backup file path

            fs.mkdirSync(this.backupFolder, { recursive: true }); // Create the "backups" folder if it does not exist

            fs.writeFile(backupFilePath, stdout, (error) => {
                if (error) {
                    console.error(`File creation error: ${error.message}`);
                } else {
                    console.log(`Backup completed. Backup file: ${backupFilePath}`);
                }
            });
        });
    }

    startBackup() {
        this.backupDatabase();
        console.log('Backup process initiated. Will repeat every hour.');
        setInterval(() => {
            this.backupDatabase();
        }, 60 * 60 * 1000);
    }
}

// Start the backup process
const databaseBackup = new DatabaseBackup();
databaseBackup.startBackup();