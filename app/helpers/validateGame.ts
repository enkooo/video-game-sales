import Ajv from 'ajv';

export function validateGameData(gameData: unknown) {
  const ajv = new Ajv();
  
  const gameSchema = {
    "type": "object",
    "properties": {
      "rank": {
        "type": "integer",
        "description": "Ranking position of the game"
      },
      "name": {
        "type": "string",
        "description": "Name of the game"
      },
      "platform": {
        "type": "string",
        "description": "Platform on which the game was released"
      },
      "year": {
        "type": "string",
        "description": "Year of game release"
      },
      "genre": {
        "type": "string",
        "description": "Genre of the game"
      },
      "publisher": {
        "type": "string",
        "description": "Publisher of the game"
      },
      "na_sales": {
        "type": "number",
        "description": "Sales in North America (in millions)"
      },
      "eu_sales": {
        "type": "number",
        "description": "Sales in Europe (in millions)"
      },
      "jp_sales": {
        "type": "number",
        "description": "Sales in Japan (in millions)"
      },
      "other_sales": {
        "type": "number",
        "description": "Sales in other regions (in millions)"
      },
      "global_sales": {
        "type": "number",
        "description": "Global sales (in millions)"
      }
    },
    "additionalProperties": false,
    "required": [
      "rank",
      "name",
      "platform",
      "year",
      "genre",
      "publisher",
      "na_sales",
      "eu_sales",
      "jp_sales",
      "other_sales",
      "global_sales"
    ]
  };

  const validate = ajv.compile(gameSchema);
  
  const isValid = validate(gameData);
  
  if (isValid) {
    return {
      isValid: true,
      message: 'Game has been validated successfully'
    };
  } else {
    const errorMessages = validate.errors ? validate.errors.map(error => {
      const property = error.instancePath.replace('/', '') || error.params.additionalProperty || 'field';
      return `${property}: ${error.message}`;
    }).join(', ') : 'Validation failed';
    
    return {
      isValid: false,
      message: errorMessages
    };
  }
}