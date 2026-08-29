
const Validator = require('Validator');

const helper = {
    
    checkValidationRules: async (request, rules) => {
        try {
            const v = Validator.make(request, rules);
            const validator = {
                status: true,
            }

            if (v.fails()) {
                const ValidatorErrors = v.getErrors();
                validator.status = false
                for (const key in ValidatorErrors) {
                    validator.error = ValidatorErrors[key][0];
                    break;
                }
            }
            return validator;
        } catch (error) {
            console.error(error.message);
        }
        return false;
    },

  
    sendResponse: async (res, resCode, msgKey, resData) => {
        try {
            const responsejson =
            {
                "code": resCode,
                "message": msgKey
            }
            if (resData != null) {
                responsejson.data = resData;
            }

            res.status(resCode).send(responsejson);

        } catch (error) {
            console.log('error', error);
            return error.message;
        }
    },
    
}

module.exports = helper;