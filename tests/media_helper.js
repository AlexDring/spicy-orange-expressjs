const initialMedia = [
  {
    Title: "Inception",
    Year: "2010",
    Rated: "PG-13",
    Released: "16 Jul 2010",
    Runtime: "148 min",
    Genre: "Action, Adventure, Sci-Fi, Thriller",
    Director: "Christopher Nolan",
    Writer: "Christopher Nolan",
    Actors: "Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page, Tom Hardy",
    Plot: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    Language: "English, Japanese, French",
    Country: "USA, UK",
    Awards: "Won 4 Oscars. Another 153 wins & 220 nominations.",
    Poster: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    Ratings: [
    {
    Source: "Internet Movie Database",
    Value: "8.8/10"
    },
    {
    Source: "Rotten Tomatoes",
    Value: "87%"
    },
    {
    Source: "Metacritic",
    Value: "74/100"
    }
    ],
    Metascore: "74",
    imdbRating: "8.8",
    imdbVotes: "2,112,329",
    imdbID: "tt1375666",
    Type: "movie",
    DVD: "20 Jun 2013",
    BoxOffice: "$292,576,195",
    Production: "Syncopy, Warner Bros.",
    Website: "N/A",
    Response: "True"
  },
  {
    Title: "Joker",
    Year: "2019",
    Rated: "R",
    Released: "04 Oct 2019",
    Runtime: "122 min",
    Genre: "Crime, Drama, Thriller",
    Director: "Todd Phillips",
    Writer: "Todd Phillips, Scott Silver, Bob Kane (based on characters created by), Bill Finger (based on characters created by), Jerry Robinson (based on characters created by)",
    Actors: "Joaquin Phoenix, Robert De Niro, Zazie Beetz, Frances Conroy",
    Plot: "In Gotham City, mentally troubled comedian Arthur Fleck is disregarded and mistreated by society. He then embarks on a downward spiral of revolution and bloody crime. This path brings him face-to-face with his alter-ego: the Joker.",
    Language: "English",
    Country: "USA, Canada",
    Awards: "Won 2 Oscars. Another 116 wins & 235 nominations.",
    Poster: "https://m.media-amazon.com/images/M/MV5BNGVjNWI4ZGUtNzE0MS00YTJmLWE0ZDctN2ZiYTk2YmI3NTYyXkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_SX300.jpg",
    Ratings: [
    {
    Source: "Internet Movie Database",
    Value: "8.4/10"
    },
    {
    Source: "Rotten Tomatoes",
    Value: "68%"
    },
    {
    Source: "Metacritic",
    Value: "59/100"
    }
    ],
    Metascore: "59",
    imdbRating: "8.4",
    imdbVotes: "985,354",
    imdbID: "tt7286456",
    Type: "movie",
    DVD: "03 Oct 2019",
    BoxOffice: "$335,451,311",
    Production: "Bron Studios, Creative Wealth Media Finance, DC Comics",
    Website: "N/A",
    Response: "True"
  }
]

const upMovie = {
  Title: "Up",
  Year: "2009",
  Rated: "PG",
  Released: "29 May 2009",
  Runtime: "96 min",
  Genre: "Animation, Adventure, Comedy, Family",
  Director: "Pete Docter, Bob Peterson(co-director)",
  Writer: "Pete Docter (story by), Bob Peterson (story by), Tom McCarthy (story by), Bob Peterson (screenplay by), Pete Docter (screenplay by)",
  Actors: "Edward Asner, Christopher Plummer, Jordan Nagai, Bob Peterson",
  Plot: "78-year-old Carl Fredricksen travels to Paradise Falls in his house equipped with balloons, inadvertently taking a young stowaway.",
  Language: "English",
  Country: "USA",
  Awards: "Won 2 Oscars. Another 77 wins & 87 nominations.",
  Poster: "https://m.media-amazon.com/images/M/MV5BMTk3NDE2NzI4NF5BMl5BanBnXkFtZTgwNzE1MzEyMTE@._V1_SX300.jpg",
  Ratings: [
    {
    Source: "Internet Movie Database",
    Value: "8.2/10"
    },
    {
    Source: "Rotten Tomatoes",
    Value: "98%"
    },
    {
    Source: "Metacritic",
    Value: "88/100"
    }
  ],
  Metascore: "88",
  imdbRating: "8.2",
  imdbVotes: "949,253",
  imdbID: "tt1049413",
  Type: "movie",
  DVD: "21 Nov 2015",
  BoxOffice: "$293,004,164",
  Production: "Pixar Animation Studios",
  Website: "N/A",
  Response: "True"
  }

const mediaInDatabase = async () => {
 return await Media.find({})
}

const mediaDetailInDatabase = async () => {
 return await MediaDetail.find({})
}

module.exports = { initialMedia, upMovie, mediaInDatabase }