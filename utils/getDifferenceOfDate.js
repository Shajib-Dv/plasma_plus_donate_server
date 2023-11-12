/** @format */

const getDifferenceOfDate = (dateString) => {
  return new Promise((resolve, reject) => {
    const givenDate = new Date(dateString);
    const currentDate = new Date();
    const timeDifference = currentDate - givenDate;
    const daysDifference = timeDifference / (1000 * 60 * 60 * 24);
    const result = daysDifference.toFixed(0);

    resolve(result);
  });
};

module.exports = getDifferenceOfDate;
