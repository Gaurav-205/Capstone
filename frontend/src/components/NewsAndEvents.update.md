# Update Instructions for NewsAndEvents.tsx

These updates need to be manually applied to the NewsAndEvents.tsx component as the automated edits were not successful. Follow these instructions:

## 1. Import the EventRegistrationButton component

Add this import at the top of the file:

```jsx
import EventRegistrationButton from './EventRegistrationButton';
```

## 2. Update the EventItem interface

Find the EventItem interface and update it to include the registrationUrl field:

```jsx
interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: 'academic' | 'social' | 'sports' | 'cultural';
  registrationUrl?: string;
}
```

## 3. Update the AddItemFormData interface

Find the AddItemFormData interface and update it to include the registrationUrl field:

```jsx
interface AddItemFormData {
  title: string;
  content: string;
  category?: string;
  priority?: 'high' | 'medium' | 'low';
  description?: string;
  date: string;
  time?: string;
  location?: string;
  type?: 'academic' | 'social' | 'sports' | 'cultural';
  registrationUrl?: string;
}
```

## 4. Add a registration URL to a sample event

Find the events array and update the first event to include a registration URL:

```jsx
const events: EventItem[] = [
  {
    id: '1',
    title: 'Annual Sports Day',
    description: 'Join us for the annual sports competition...',
    date: '2024-04-15',
    time: '9:00 AM',
    location: 'University Stadium',
    type: 'sports',
    registrationUrl: 'https://university-sports.example.com/register',
  },
  // ... other events ...
];
```

## 5. Add a registration URL field to the event form

Find the event form section (around line 400, in the addItemType === 'event' condition) and add this TextField after the location field:

```jsx
<TextField
  label="Registration URL"
  fullWidth
  value={formData.registrationUrl || ''}
  onChange={(e) => setFormData({ ...formData, registrationUrl: e.target.value })}
  placeholder="https://example.com/register"
  helperText="Optional: URL for event registration"
/>
```

## 6. Use the EventRegistrationButton in the event card

Find the event card's CardActions (around line 570) and update it to include the EventRegistrationButton:

```jsx
<CardActions sx={{ justifyContent: 'space-between' }}>
  <Box display="flex" alignItems="center">
    <Button 
      size="small" 
      startIcon={<ArrowForwardIcon />}
      onClick={() => handleReadMore(event)}
    >
      View Details
    </Button>
    <EventRegistrationButton
      registrationUrl={event.registrationUrl}
      buttonProps={{ size: "small", sx: { ml: 1 } }}
    />
  </Box>
  <Box>
    <IconButton 
      size="small" 
      onClick={() => handleShare(event)}
    >
      <ShareIcon />
    </IconButton>
  </Box>
</CardActions>
```

## 7. Update the dialog actions

Find the dialog actions section (around line 680) and update it to use the registration URL if available:

```jsx
<DialogActions>
  <Button onClick={handleCloseDialog}>Close</Button>
  {selectedItem && 'type' in selectedItem && (
    selectedItem.registrationUrl ? (
      <Button 
        variant="contained" 
        color="primary"
        href={selectedItem.registrationUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        Register Now
      </Button>
    ) : (
      <Button 
        variant="contained" 
        onClick={() => {
          handleCloseDialog();
          navigate(`/events/${selectedItem.id}`);
        }}
      >
        View Event Details
      </Button>
    )
  )}
</DialogActions>
``` 