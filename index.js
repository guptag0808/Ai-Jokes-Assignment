// index.js
const fs = require('fs');
const request = require('request');

const apiUrl = 'https://icanhazdadjoke.com/search';

const searchTerm = process.argv[2];

if (searchTerm === 'leaderboard') {
  displayLeaderboard();
} else if (searchTerm) {
  searchForJoke(searchTerm);
} else {
  console.log('Please provide a search term or use "leaderboard" to view the leaderboard.');
  process.exit(1);
}

function searchForJoke(searchTerm) {
  // Make a request to the joke API
  request({
    url: `${apiUrl}?term=${searchTerm}`,
    headers: { 'Accept': 'application/json' }
  }, (error, response, body) => {
    if (error) {
      console.error('Error making API request:', error);
      process.exit(1);
    }

    const data = JSON.parse(body);

    if (data.results && data.results.length > 0) {
      // Select a random joke
      const randomJoke = data.results[Math.floor(Math.random() * data.results.length)];

      // Display the joke
      console.log(`Here's a joke for you: ${randomJoke.joke}`);

      // Ask the user to rate the joke
      askForRating(randomJoke.joke);
    } else {
      console.log('Sorry, no jokes found for that term. The joke gods are taking a day off.');
    }
  });
}

function askForRating(joke) {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  readline.question(` Please Rate this joke from 1 to 5 (1=worst, 5=best): `, (answer) => {
    const rating = parseInt(answer);

    if (isNaN(rating) || rating < 1 || rating > 5) {
      console.log('Invalid rating. Please enter a number between 1 and 5.');
    } else {
      // Save the rating to ratings.txt
      saveRating(joke, rating);
    }

    readline.close();
  });
}

function saveRating(joke, rating) {
  fs.appendFile('jokes.txt', `${joke}:${rating}\n`, (err) => {
    if (err) console.error('Error saving rating to file:', err);
  });
}

function displayLeaderboard() {
  fs.readFile('jokes.txt', 'utf-8', (err, data) => {
    if (err) {
      console.error('Error reading ratings file:', err);
      process.exit(1);
    }

    const ratings = data.split('\n').filter(rating => rating.trim() !== '');

    if (ratings.length === 0) {
      console.log('No Popullar jokes found. Be the first to rate a joke!');
      return;
    }

    // Create a map to store the highest rating for each joke
    const highestRatings = {};

    // Process each rating and update the highest rating for each joke
    ratings.forEach((rating) => {
      const [joke, userRating] = rating.split(':');
      const currentRating = parseInt(userRating);
      if (!highestRatings[joke] || currentRating > highestRatings[joke]) {
        highestRatings[joke] = currentRating;
      }
    });

    // Sort jokes based on highest ratings
    const sortedJokes = Object.keys(highestRatings).sort((a, b) => highestRatings[b] - highestRatings[a]);
  
    // Display the leaderboard
	console.log('🏆 Leaderboard:')
	for(let i=0;i<5;i++){
		let joke= sortedJokes[i]
		console.log(`${joke}: Highest Rating - ${highestRatings[joke]}`);
	}
    ;
   
  });
}
