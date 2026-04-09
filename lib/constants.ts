import type {
  ChecklistTag,
  DestinationKey,
  DestinationOption,
  ReadinessStatus,
  RelationshipType,
  ScenePack,
  TravelStyleKey,
  TravelStyleOption,
} from "@/types/domain";

export const RELATIONSHIP_OPTIONS: Array<{
  value: RelationshipType;
  label: string;
}> = [
  { value: "self", label: "Self" },
  { value: "partner", label: "Partner" },
  { value: "child", label: "Child" },
  { value: "parent", label: "Parent" },
  { value: "friend", label: "Friend" },
  { value: "pet", label: "Pet" },
  { value: "other", label: "Other" },
];

type ChecklistItem = {
  key: ChecklistTag;
  label: string;
  hint: string;
};

export const DESTINATIONS: DestinationOption[] = [
  {
    value: "new-york",
    label: "New York",
    description: "Editorial city scenes with motion, skyline, and polished street energy.",
  },
  {
    value: "paris",
    label: "Paris",
    description: "Soft romantic streets, cafes, gardens, and timeless architectural moments.",
  },
  {
    value: "tokyo",
    label: "Tokyo",
    description: "Layered neon, transit details, quiet alleys, and cinematic urban contrast.",
  },
  {
    value: "dubai",
    label: "Dubai",
    description: "Warm light, refined luxury, skyline drama, and elevated resort atmosphere.",
  },
];

export const TRAVEL_STYLES: TravelStyleOption[] = [
  {
    value: "casual-travel",
    label: "Casual Travel",
    description: "Relaxed city-ready looks with natural movement and practical travel styling.",
  },
  {
    value: "premium-elegant",
    label: "Premium Elegant",
    description: "Sharper silhouettes, elevated fabrics, and polished destination styling.",
  },
  {
    value: "romantic",
    label: "Romantic",
    description: "Soft mood, intimate framing, and gentle wardrobe direction for couples.",
  },
  {
    value: "family-travel",
    label: "Family Travel",
    description: "Warm candid scenes with clean styling and grounded shared travel moments.",
  },
];

export const IMAGE_COUNT_OPTIONS = [8, 10, 12] as const;

export const PROFILE_CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    key: "frontPortrait",
    label: "Front portrait",
    hint: "A clear, centered front-facing portrait helps anchor identity.",
  },
  {
    key: "leftSide",
    label: "Left side",
    hint: "A slight left-side view improves facial angle consistency.",
  },
  {
    key: "rightSide",
    label: "Right side",
    hint: "A slight right-side view helps the generator learn asymmetry.",
  },
  {
    key: "halfBody",
    label: "Half body",
    hint: "Waist-up framing supports outfit and posture continuity.",
  },
  {
    key: "fullBody",
    label: "Full body",
    hint: "Full-body references help with travel scenes and silhouette matching.",
  },
  {
    key: "neutralExpression",
    label: "Neutral expression",
    hint: "Natural resting face examples reduce drift between images.",
  },
  {
    key: "smiling",
    label: "Smiling",
    hint: "A relaxed smile gives the set more expressive range.",
  },
  {
    key: "goodLighting",
    label: "Good lighting",
    hint: "Bright, evenly lit photos tend to produce stronger identity retention.",
  },
];

export const PET_PROFILE_CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    key: "frontPortrait",
    label: "Face forward",
    hint: "A clear front-facing pet photo helps anchor the muzzle, eyes, and ear placement.",
  },
  {
    key: "leftSide",
    label: "Left profile",
    hint: "A left-side pet angle helps preserve facial shape and breed traits.",
  },
  {
    key: "rightSide",
    label: "Right profile",
    hint: "A right-side pet angle helps keep asymmetry and markings stable.",
  },
  {
    key: "fullBody",
    label: "Full body",
    hint: "A full-body pet photo helps keep body size, proportions, and tail placement believable.",
  },
  {
    key: "standingPose",
    label: "Standing pose",
    hint: "Standing references help preserve leg length, posture, and overall silhouette.",
  },
  {
    key: "sittingPose",
    label: "Sitting pose",
    hint: "A seated pose gives the model another natural posture to preserve.",
  },
  {
    key: "coatPattern",
    label: "Coat markings",
    hint: "Use photos where fur color, markings, and texture are clearly visible.",
  },
  {
    key: "goodLighting",
    label: "Good lighting",
    hint: "Bright, evenly lit pet photos make breed and fur details much easier to retain.",
  },
];

export const ALL_PROFILE_CHECKLIST_ITEMS: ChecklistItem[] = Array.from(
  new Map(
    [...PROFILE_CHECKLIST_ITEMS, ...PET_PROFILE_CHECKLIST_ITEMS].map((item) => [
      item.key,
      item,
    ]),
  ).values(),
);

export const JOB_STATUS_LABELS: Record<string, string> = {
  all: "All",
  pending: "Pending",
  processing: "Processing",
  completed: "Completed",
  failed: "Failed",
};

export const READINESS_COPY: Record<ReadinessStatus, string> = {
  incomplete: "Needs at least 8 photos to be generation-ready.",
  ready: "Ready for controlled destination generation tests.",
};

export const SCENE_PACKS: Record<DestinationKey, ScenePack> = {
  "new-york": {
    id: "scene-pack-new-york-v1",
    destination: "new-york",
    scenes: [
      { key: "times_square", title: "Times Square", description: "Confident city arrival with bright billboards and layered pedestrians.", wardrobeHint: "Smart city layers and clean sneakers." },
      { key: "central_park", title: "Central Park", description: "Morning stroll on a tree-lined path with soft natural light.", wardrobeHint: "Relaxed coat, knitwear, or tonal casualwear." },
      { key: "brooklyn_bridge", title: "Brooklyn Bridge", description: "Windy bridge portrait with skyline depth and cinematic perspective.", wardrobeHint: "Structured outerwear with movement." },
      { key: "yellow_cab_street", title: "Yellow Cab Street", description: "Street-level crosswalk scene with classic New York taxi color.", wardrobeHint: "Refined travel basics with statement jacket." },
      { key: "rooftop_skyline", title: "Rooftop Skyline", description: "Golden-hour rooftop portrait overlooking the Manhattan skyline.", wardrobeHint: "Elevated evening travel styling." },
      { key: "coffee_shop_moment", title: "Coffee Shop Moment", description: "Editorial cafe scene with a quiet table and polished candid framing.", wardrobeHint: "Textured knit, trench, or tonal neutrals." },
      { key: "subway_scene", title: "Subway Scene", description: "Clean transit portrait with realistic station energy and motion.", wardrobeHint: "Modern commuter styling with layered basics." },
      { key: "evening_city_walk", title: "Evening City Walk", description: "Soft blue-hour walk through lit storefront streets.", wardrobeHint: "Evening coat and understated accessories." },
      { key: "museum_steps", title: "Museum Steps", description: "Architectural portrait at grand stone steps with editorial symmetry.", wardrobeHint: "Tailored separates with crisp lines." },
      { key: "west_village_corner", title: "West Village Corner", description: "Quiet brownstone block with lifestyle street-style framing.", wardrobeHint: "Soft luxury casualwear." },
      { key: "hotel_lobby_arrival", title: "Hotel Lobby Arrival", description: "Premium hotel check-in mood with luggage and warm lighting.", wardrobeHint: "Smart travel layers and leather details." },
      { key: "high_line_sunset", title: "High Line Sunset", description: "Sunset promenade view with urban greenery and skyline depth.", wardrobeHint: "Polished relaxed set with muted tones." },
    ],
  },
  paris: {
    id: "scene-pack-paris-v1",
    destination: "paris",
    scenes: [
      { key: "eiffel_tower", title: "Eiffel Tower", description: "Iconic morning portrait with subtle tower framing and elegant distance.", wardrobeHint: "Soft tailoring and understated neutrals." },
      { key: "paris_cafe", title: "Paris Cafe", description: "Outdoor cafe moment with coffee, marble table, and quiet street charm.", wardrobeHint: "Refined knitwear or lightweight blazer." },
      { key: "seine_riverside", title: "Seine Riverside", description: "Walking portrait beside the river with classic stone textures.", wardrobeHint: "Trench or softly layered citywear." },
      { key: "louvre_courtyard", title: "Louvre Courtyard", description: "Architectural frame with clean geometry and premium travel polish.", wardrobeHint: "Crisp monochrome or elegant tailoring." },
      { key: "paris_street_style", title: "Paris Street Style", description: "Fashion-led side street portrait with editorial posture and calm movement.", wardrobeHint: "Tailored silhouette with effortless accessories." },
      { key: "balcony_moment", title: "Balcony Moment", description: "Classic Parisian balcony scene with city rooftops and soft morning light.", wardrobeHint: "Silk textures, relaxed shirt, or elegant knit." },
      { key: "evening_lights", title: "Evening Lights", description: "Blue-hour city lights with reflective pavement and romantic tone.", wardrobeHint: "Dark outerwear with elevated evening feel." },
      { key: "garden_walk", title: "Garden Walk", description: "Natural stroll through manicured Paris gardens with relaxed composition.", wardrobeHint: "Soft neutrals and comfortable polished layers." },
      { key: "bookshop_scene", title: "Bookshop Scene", description: "Quiet literary moment with curated shelves and warm interior glow.", wardrobeHint: "Textured knit or elegant coat." },
      { key: "montmartre_steps", title: "Montmartre Steps", description: "Layered hillside steps with cafe energy and cinematic depth.", wardrobeHint: "City-chic separates with subtle contrast." },
      { key: "river_bridge_evening", title: "River Bridge Evening", description: "Romantic bridge view with soft light and intimate framing.", wardrobeHint: "Evening-ready layers with warm neutrals." },
      { key: "gallery_entry", title: "Gallery Entry", description: "Quiet gallery doorway with refined lifestyle composition.", wardrobeHint: "Minimal premium styling." },
    ],
  },
  tokyo: {
    id: "scene-pack-tokyo-v1",
    destination: "tokyo",
    scenes: [
      { key: "shibuya_crossing", title: "Shibuya Crossing", description: "Dynamic city portrait with motion blur and controlled street energy.", wardrobeHint: "Sharp streetwear with clean structure." },
      { key: "neon_street", title: "Neon Street", description: "Night scene with vibrant signage and polished cinematic color.", wardrobeHint: "Modern layered dark tones." },
      { key: "quiet_alley", title: "Quiet Alley", description: "Calmer side street portrait with lantern detail and intimate framing.", wardrobeHint: "Minimal city styling and textured layers." },
      { key: "city_viewpoint", title: "City Viewpoint", description: "High-rise observation portrait with expansive skyline depth.", wardrobeHint: "Premium casualwear with refined fit." },
      { key: "train_station_scene", title: "Train Station Scene", description: "Transit moment with realistic platform atmosphere and symmetry.", wardrobeHint: "Clean commuter layers and compact accessories." },
      { key: "cafe_scene", title: "Cafe Scene", description: "Contemporary cafe portrait with warm wood and focused composition.", wardrobeHint: "Relaxed monochrome or tonal basics." },
      { key: "shopping_district", title: "Shopping District", description: "Lifestyle walk through a curated retail street with energetic framing.", wardrobeHint: "Editorial casual with sleek outerwear." },
      { key: "evening_tokyo_walk", title: "Evening Tokyo Walk", description: "Blue-hour stroll with balanced neon reflections and grounded realism.", wardrobeHint: "Layered night-out citywear." },
      { key: "temple_entry", title: "Temple Entry", description: "Quiet cultural scene with warm wood, stone paths, and stillness.", wardrobeHint: "Understated travel pieces with calm palette." },
      { key: "rooftop_bar", title: "Rooftop Bar", description: "Polished evening portrait with skyline lights and premium hospitality detail.", wardrobeHint: "Elevated evening styling." },
      { key: "arcade_scene", title: "Arcade Scene", description: "Playful but composed travel moment with color and urban depth.", wardrobeHint: "Contemporary street-inspired casualwear." },
      { key: "morning_market", title: "Morning Market", description: "Fresh daylight scene with subtle market textures and candid movement.", wardrobeHint: "Soft tailored basics with comfortable fit." },
    ],
  },
  dubai: {
    id: "scene-pack-dubai-v1",
    destination: "dubai",
    scenes: [
      { key: "downtown_skyline", title: "Downtown Skyline", description: "Polished arrival portrait with skyline depth and warm city light.", wardrobeHint: "Tailored travelwear with luxury finish." },
      { key: "desert_edge", title: "Desert Edge", description: "Soft sunset portrait at the city-desert boundary with warm sand tones.", wardrobeHint: "Flowing neutrals or refined resort styling." },
      { key: "marina_walk", title: "Marina Walk", description: "Waterfront lifestyle scene with modern towers and relaxed confidence.", wardrobeHint: "Premium casual with sunglasses or elegant accessories." },
      { key: "luxury_hotel_lobby", title: "Luxury Hotel Lobby", description: "High-end lobby portrait with architectural symmetry and soft gold light.", wardrobeHint: "Statement outerwear or elevated coordinated set." },
      { key: "palm_view", title: "Palm View", description: "Open-air terrace portrait with resort coastline atmosphere.", wardrobeHint: "Resort polish and light premium fabrics." },
      { key: "rooftop_evening", title: "Rooftop Evening", description: "Sunset rooftop composition with skyline glow and polished evening mood.", wardrobeHint: "Evening-ready tailoring or elegant dress code." },
      { key: "shopping_avenue", title: "Shopping Avenue", description: "Luxury retail walk with clean lines and lifestyle travel framing.", wardrobeHint: "Structured, premium casual wardrobe." },
      { key: "sunset_city_scene", title: "Sunset City Scene", description: "Golden-hour city portrait with warm shadows and reflective surfaces.", wardrobeHint: "Soft monochrome and sleek accessories." },
      { key: "beach_club_arrival", title: "Beach Club Arrival", description: "Refined seaside entrance moment with clean resort architecture.", wardrobeHint: "Modern resort wear with relaxed luxury." },
      { key: "courtyard_breakfast", title: "Courtyard Breakfast", description: "Morning dining scene with quiet luxury and soft desert light.", wardrobeHint: "Light linen or elevated daytime set." },
      { key: "museum_walk", title: "Museum Walk", description: "Architectural cultural scene with minimalist lines and soft shadows.", wardrobeHint: "Minimal polished layers." },
      { key: "night_fountain_view", title: "Night Fountain View", description: "Evening landmark portrait with water reflections and a premium finish.", wardrobeHint: "Dark evening palette with sleek lines." },
    ],
  },
};

export function getDestinationLabel(destination: DestinationKey) {
  return DESTINATIONS.find((item) => item.value === destination)?.label ?? destination;
}

export function getStyleLabel(style: TravelStyleKey) {
  return TRAVEL_STYLES.find((item) => item.value === style)?.label ?? style;
}

export function getRelationshipLabel(value: RelationshipType) {
  return RELATIONSHIP_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

export function getChecklistItemsForRelationship(value: RelationshipType) {
  return value === "pet" ? PET_PROFILE_CHECKLIST_ITEMS : PROFILE_CHECKLIST_ITEMS;
}

export function getScenePack(destination: DestinationKey) {
  return SCENE_PACKS[destination];
}

export function getSceneSelection(destination: DestinationKey, imageCount: 8 | 10 | 12) {
  return getScenePack(destination).scenes.slice(0, imageCount);
}
