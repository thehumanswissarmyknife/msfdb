
//This is our custom lib for flow control in Node.js
//ref http://book.mixu.net/node/ch7.html
//              Usage
//series([
//    function (next) { asyncTask(1, next); },
//    function (next) { asyncTask(2, next); },
//    function (next) { asyncTask(3, next); },
//], function(result){ /*what ever do with result*/});

module.exports = {
    //make I/O in series 
    series: function (callbacks, last) {
        var results = [];
        function next() {
            var callback = callbacks.shift();
            if (callback) {
                callback(function () {
                    results.push(Array.prototype.slice.call(arguments));
                    next();
                });
            } else {
                last(results);
            }
        }
        next();
    },
    //limits how many iteration should be in parallel 2 3 4
    limitedParallel : function (limit, callbacks, last) {
        var results = [];
        var running = 1;
        var task = 0;
        function next() {
            running--;
            if (task == callbacks.length && running == 0) {
                last(results);
            }
            while (running < limit && callbacks[task]) {
                var callback = callbacks[task];
                (function (index) {
                    callback(function () {
                        results[index] = Array.prototype.slice.call(arguments);
                        next();
                    });
                })(task);
                task++;
                running++;
            }
        }
        next();
    },
    //currently in use in notification service
    fullParallel: function (callbacks, last) {
        var results = [];
        var result_count = 0;
        callbacks.forEach(function (callback, index) {
            callback(function () {
                results[index] = Array.prototype.slice.call(arguments);
                result_count++;
                if (result_count == callbacks.length) {
                    last(results);
                }
            });
        });
    }
};