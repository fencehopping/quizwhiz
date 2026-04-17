export type MockSourceStory = {
  sourceTitle: string;
  sourceSummary: string;
  sourceUrl: string;
  sourcePublishedAt: string;
  rawContent?: string;
};

export const mockStories: MockSourceStory[] = [
  {
    sourceTitle: "City Students Build Solar Bus Stop Lights",
    sourceSummary:
      "A student engineering club partnered with the city to install small solar lights at bus stops so riders can read route signs after dark.",
    sourceUrl: "https://example.org/news/solar-bus-stop-lights",
    sourcePublishedAt: "2026-04-16T13:00:00Z",
  },
  {
    sourceTitle: "Library Starts Weekend Language Exchange",
    sourceSummary:
      "A public library launched a free Saturday program where teens and adults practice conversational English and Spanish in guided groups.",
    sourceUrl: "https://example.org/news/library-language-exchange",
    sourcePublishedAt: "2026-04-15T10:00:00Z",
  },
  {
    sourceTitle: "River Cleanup Team Tracks Plastic Waste",
    sourceSummary:
      "Volunteers used a new tracking app during a cleanup day to measure the amount and type of plastic collected near local riverbanks.",
    sourceUrl: "https://example.org/news/river-cleanup-app",
    sourcePublishedAt: "2026-04-14T09:30:00Z",
  },
  {
    sourceTitle: "High School Adds Quiet Study Courtyard",
    sourceSummary:
      "After student feedback, a high school converted an unused courtyard into a quiet reading and study zone with shade and seating.",
    sourceUrl: "https://example.org/news/quiet-study-courtyard",
    sourcePublishedAt: "2026-04-14T15:10:00Z",
  },
  {
    sourceTitle: "Teen Robotics Team Wins Regional Match",
    sourceSummary:
      "A local robotics team won a regional competition by designing a robot arm that sorted objects faster and with fewer errors.",
    sourceUrl: "https://example.org/news/robotics-regional-win",
    sourcePublishedAt: "2026-04-13T18:00:00Z",
  },
  {
    sourceTitle: "Neighborhood Garden Doubles Food Donations",
    sourceSummary:
      "Community volunteers expanded a garden project and doubled the number of fresh produce boxes donated to nearby families this month.",
    sourceUrl: "https://example.org/news/garden-food-donations",
    sourcePublishedAt: "2026-04-12T12:45:00Z",
  },
  {
    sourceTitle: "Transit App Adds Live Elevator Alerts",
    sourceSummary:
      "A city transit app now sends live alerts when station elevators are out of service to help riders plan accessible routes.",
    sourceUrl: "https://example.org/news/transit-elevator-alerts",
    sourcePublishedAt: "2026-04-12T08:20:00Z",
  },
  {
    sourceTitle: "Museum Offers Student Audio Guide Challenge",
    sourceSummary:
      "A science museum invited students to script short audio guides for exhibits, and winning entries will be recorded for summer visitors.",
    sourceUrl: "https://example.org/news/student-audio-guide",
    sourcePublishedAt: "2026-04-11T17:30:00Z",
  },
  {
    sourceTitle: "City Park Tests Heat-Relief Stations",
    sourceSummary:
      "Parks staff tested shaded cooling stations and water refill points after a warm spring week to improve safety during outdoor events.",
    sourceUrl: "https://example.org/news/park-heat-relief",
    sourcePublishedAt: "2026-04-10T14:05:00Z",
  },
  {
    sourceTitle: "Students Launch School Podcast on Local History",
    sourceSummary:
      "Middle and high school students collaborated on a podcast series featuring interviews with longtime residents about neighborhood history.",
    sourceUrl: "https://example.org/news/school-local-history-podcast",
    sourcePublishedAt: "2026-04-09T11:15:00Z",
  },
];
