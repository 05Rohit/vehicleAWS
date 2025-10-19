// logger.js
const winston = require('winston');
const path = require('path');

// Helper to get the first stack frame outside logger/winston internals
function getCallerInfo() {
  const orig = Error.prepareStackTrace;
  Error.prepareStackTrace = (_, stack) => stack;
  const err = new Error();
  const stack = err.stack;
  Error.prepareStackTrace = orig;

  // Find the first stack frame outside node_modules and this logger file
  let caller;
  for (let i = 2; i < stack.length; i++) {
    const fileName = stack[i].getFileName();
    if (
      fileName &&
      !fileName.includes('node_modules') &&
      !fileName.endsWith('utils/logger.js')
    ) {
      caller = stack[i];
      break;
    }
  }
  if (!caller) return '';
  const file = path.relative(process.cwd(), caller.getFileName() || '');
  const func = caller.getFunctionName() || '<anonymous>';
  const line = caller.getLineNumber();
  return `${file}:${func}:${line}`;
}

// Custom format to include caller info
const logFormat = winston.format.printf(({ timestamp, level, message, stack }) => {
  const callerInfo = getCallerInfo();
  return `${level}:- [${callerInfo}] ${message} ${stack || ''} ${timestamp} `;
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({
      filename: 'logs/app.log',
      level: 'info',
    })
  ]
});

module.exports = logger;
