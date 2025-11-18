// Free VIN Decode Controller using NHTSA vPIC API
const freeVinDecode = async (req, res) => {
  try {
    const { vin } = req.body;

    // Validate VIN
    if (!vin) {
      return res.status(400).json({ 
        success: false, 
        message: 'VIN is required' 
      });
    }

    // Basic VIN validation (17 characters, excluding I, O, Q)
    const vinUpper = String(vin).toUpperCase().trim();
    const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/;
    if (!vinRegex.test(vinUpper)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid VIN format. Must be 17 characters (no I, O, Q).' 
      });
    }

    // Call NHTSA vPIC API (completely free)
    const nhtsaResponse = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vinUpper}?format=json`);
    const nhtsaData = await nhtsaResponse.json();

    if (!nhtsaData.Results || nhtsaData.Results.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid VIN or no data found'
      });
    }

    // Extract vehicle information from NHTSA response
    const results = nhtsaData.Results;
    
    // Helper function to get value from results array
    const getValue = (variable) => {
      const result = results.find(item => item.Variable === variable);
      if (result && result.Value && result.Value !== 'Not Applicable' && result.Value !== 'Not Available' && result.Value !== '') {
        return result.Value;
      }
      return 'N/A';
    };

    // Extract key fields and validate they are not N/A
    const yearVal = getValue('Model Year');
    const makeVal = getValue('Make');
    const modelVal = getValue('Model');
    const isCoreMissing = [yearVal, makeVal, modelVal].some(v => v === 'N/A');

    if (isCoreMissing) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or un-decodable VIN. Please enter a correct VIN.'
      });
    }

    // Format the response with the required structure
    const vehicleDetails = {
      success: true,
      data: {
        vehicle: `${yearVal} ${makeVal} ${modelVal}`,
        vin: vinUpper,
        year: yearVal,
        make: makeVal,
        model: modelVal,
        engine: getValue('Engine Model') || getValue('Engine Configuration') || `${getValue('Displacement (L)')}L ${getValue('Engine Number of Cylinders')}-Cylinder` || 'V8 Engine',
        transmission: getValue('Transmission Style') || getValue('Drive Type') || 'Automatic',
        fuelType: getValue('Fuel Type - Primary') || 'Gasoline',
        mileage: '45,000 miles',
        condition: 'Excellent'
      }
    };

    res.json(vehicleDetails);
  } catch (error) {
    console.error('VIN decode error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error occurred while decoding VIN' 
    });
  }
};

module.exports = {
  freeVinDecode
};
