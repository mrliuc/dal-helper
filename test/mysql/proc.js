var config = require('./config');

var dalHelper = require('../dalHelper').setConfig(config);

// console.log(dalHelper)

dalHelper.proc('exec [sp_GetSequenceNo] @SequenceType, 1, 1, @Max,@SequenceNo output', { SequenceType: 1, Max: 9999 }, { SequenceNo: 0 },
    function(err, result, outParam) {

        console.log(result, outParam)
    });