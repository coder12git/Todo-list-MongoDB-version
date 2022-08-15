// Instead of module.exports we can directly use exports
exports.getDate = function getDate(){
  const today = new Date();
  const options = {
    weekday : "long",
    day : "numeric",
    month : "long",
    year : "numeric"
  };
  return today.toLocaleDateString("en-US",options);

};

exports.getDay = function getDay(){
  const today = new Date();
  const options = {
    weekday : "long"
  };
  return today.toLocaleDateString("en-US",options);
};
