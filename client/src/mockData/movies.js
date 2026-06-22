export const mockMovies = [
  {
    id: "1",
    name: "The Grand Adventure",
    language: "English",
    district: "North",
    description: "An epic journey across uncharted lands.",
    rating: 4.8,
    trailerId: "dQw4w9WgXcQ",
    poster: "https://images.unsplash.com/photo-1542206391-1a8c68f1e3f6?q=80&w=400&auto=format&fit=crop",
    status: "NOW_SHOWING",
    isTrending: true,
    genre: ["Adventure", "Action"],
    director: "Jane Doe",
    runtime: "130m",
    reviews: [],
    theaters: [
      {
        name: "Cinema Prime North",
        address: "123 North St, City",
        shows: [
          { id: "s1", time: "2026-05-20T14:00:00Z", seatsAvailable: 120 },
          { id: "s2", time: "2026-05-20T18:00:00Z", seatsAvailable: 115 }
        ]
      },
      {
        name: "Galaxy Multiplex",
        address: "45 Galaxy Ave, City",
        shows: [
          { id: "s3", time: "2026-05-21T16:30:00Z", seatsAvailable: 100 },
          { id: "s4", time: "2026-05-21T20:30:00Z", seatsAvailable: 95 }
        ]
      }
    ]
  },
  {
    id: "2",
    name: "Comedy Nights",
    language: "Hindi",
    district: "South",
    description: "Laugh out loud with the best comedians.",
    rating: 4.5,
    trailerId: "eY52Zsg-KVI",
    poster: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400&auto=format&fit=crop",
    status: "COMING_SOON",
    isTrending: false,
    genre: ["Comedy"],
    director: "John Smith",
    runtime: "110m",
    reviews: [],
    theaters: []
  },
  {
    id: "3",
    name: "Mystery of the Lost City",
    language: "English",
    district: "East",
    description: "A detective uncovers ancient secrets.",
    rating: 4.2,
    trailerId: "V-_O7nl0Ii0",
    poster: "https://images.unsplash.com/photo-1581320540771-bb5a3e809885?q=80&w=400&auto=format&fit=crop",
    status: "NOW_SHOWING",
    isTrending: true,
    genre: ["Mystery", "Drama"],
    director: "Alice Johnson",
    runtime: "125m",
    reviews: [],
    theaters: []
  }
];
