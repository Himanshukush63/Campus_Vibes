const User = require("../models/User");

const getGenderDistribution = async (req, res) => {
    try {
      const users = await User.aggregate([
        {
          $group: {
            _id: '$gender',
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            gender: '$_id',
            count: 1,
          },
        },
      ]);
  
      // Format the data for the chart
      const genderData = {
        male: 0,
        female: 0,
        other: 0,
      };
  
      users.forEach((item) => {
        genderData[item.gender] = item.count;
      });
  
      res.status(200).json({
        success: true,
        data: genderData,
      });
    } catch (error) {
      console.error('Error fetching gender distribution:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  module.exports = { getGenderDistribution };
