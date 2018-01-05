log('info', 'exec pk10timer...');

if (shell.which('node')) {
    log('info', 'node ./bin/pk10timer.js');
    shell.exec("node ./bin/pk10timer.js");
}

log('info', 'exec pk10timer end.');