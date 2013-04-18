var _ = require('underscore');

module.exports = function(obj, deep) {
    if (!_.isObject(obj) || _.isFunction(obj)) return obj;
    if (_.isDate(obj)) return new Date(obj.getTime());
    if (_.isRegExp(obj)) return new RegExp(obj.source, obj.toString().replace(/.*\//, ""));
    var isArr = (_.isArray(obj) || _.isArguments(obj));
    if (deep) {
        var func = function (memo, value, key) {
            if (isArr)
                memo.push(_.clone(value, true));
            else
                memo[key] = _.clone(value, true);
                return memo;
        };
        //console.log(obj);
        return _.reduce(obj, func, isArr ? [] : {});
    } else {
        return isArr ? slice.call(obj) : _.extend({}, obj);
    }
};