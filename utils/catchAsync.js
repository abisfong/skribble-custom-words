// jshint esversion: 9
module.exports = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
