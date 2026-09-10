// Portable schema definitions for the future Sanity Studio.
// The design-system preview does not claim to be connected to a live dataset.
export const schemaTypes = [
 { name: 'event', title: 'Event', type: 'document', fields: [
  { name: 'title', title: 'Title', type: 'string' },
  { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' } },
  { name: 'startsAt', title: 'Starts at', type: 'datetime' },
  { name: 'category', title: 'Category', type: 'string', options: { list: ['Music','Art','Street','Community'] } },
  { name: 'poster', title: 'Poster', type: 'image', options: { hotspot: true }, fields: [{ name: 'alt', title: 'Image description', type: 'string' }] },
  { name: 'description', title: 'Description', type: 'text' },
  { name: 'ticketUrl', title: 'Ticket URL', type: 'url' },
  { name: 'agePolicy', title: 'Admission age policy', type: 'string' }
 ] },
 { name: 'menuItem', title: 'Menu item', type: 'document', fields: [
  { name: 'name', title: 'Name', type: 'string' },
  { name: 'category', title: 'Category', type: 'string' },
  { name: 'description', title: 'Description', type: 'text' },
  { name: 'priceRon', title: 'Price (RON)', type: 'number' },
  { name: 'available', title: 'Available', type: 'boolean', initialValue: true }
 ] },
 { name: 'venue', title: 'Venue information', type: 'document', fields: [
  { name: 'name', title: 'Name', type: 'string' },
  { name: 'address', title: 'Address', type: 'string' },
  { name: 'openingHours', title: 'Opening hours', type: 'text' },
  { name: 'instagramUrl', title: 'Instagram URL', type: 'url' },
  { name: 'mapsUrl', title: 'Google Maps URL', type: 'url' }
 ] }
];
