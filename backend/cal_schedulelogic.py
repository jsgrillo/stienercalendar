from datetime import datetime, timedelta

def generate_schedule(activities):
    """Assigns each activity a timeslot in a weekly schedule."""
    start_time = datetime.now().replace(hour=17, minute=0)  # Start at 8 AM
    week_days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    
    schedule = []
    current_day = 0  # Start from Monday

    for activity in activities:
        
        schedule.append({
            "day": week_days[current_day],
            "activity": activity["name"],
            "category": activity["category"],
            "time": start_time.strftime("%H:%M"),
            "duration": activity["duration"]
        })
        
        start_time += timedelta(hours=activity["duration"])  # Adjust time by duration

        if start_time.hour >= 20:  # Move to the next day
            if current_day >= 5:
                start_time = datetime.now().replace(hour=8, minute=0)  # Reset to 9 AM
                current_day = (current_day + 1) % 7  # Cycle through the week
            else:
                start_time = datetime.now().replace(hour=17, minute=0)  # Reset to 9 AM
                current_day = (current_day + 1) % 7  # Cycle through the week

    return schedule
