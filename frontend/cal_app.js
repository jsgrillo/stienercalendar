let activities = [];

function addActivity() {
    let activityInput = document.getElementById("activity").value.trim();
    let category = document.getElementById("category").value;
    let duration = parseFloat(document.getElementById("duration").value);

    if (activityInput && duration > 0) {
        activities.push({ name: activityInput, category: category, duration: duration });

        let listId;
        switch (category) {
            case "Work":
                listId = "work-list";
                break;
            case "Exercise":
                listId = "exercise-list";
                break;
            case "Leisure":
                listId = "leisure-list";
                break;
            case "Other":
                listId = "other-list";
                break;
        }

        document.getElementById(listId).innerHTML += 
            `<li>${activityInput} - (${duration} hrs)</li>`;

        document.getElementById("activity").value = "";
        document.getElementById("duration").value = "";
    }
}

function addWorkWeek() {
    const workWeek = [
        { day: "Monday", time: "09:00", duration: 3, activity: "Work", category: "Work" },
        { day: "Monday", time: "13:00", duration: 4, activity: "Work", category: "Work" },
        { day: "Tuesday", time: "09:00", duration: 3, activity: "Work", category: "Work" },
        { day: "Tuesday", time: "13:00", duration: 4, activity: "Work", category: "Work" },
        { day: "Wednesday", time: "09:00", duration: 3, activity: "Work", category: "Work" },
        { day: "Wednesday", time: "13:00", duration: 4, activity: "Work", category: "Work" },
        { day: "Thursday", time: "09:00", duration: 3, activity: "Work", category: "Work" },
        { day: "Thursday", time: "13:00", duration: 4, activity: "Work", category: "Work" },
        { day: "Friday", time: "09:00", duration: 3, activity: "Work", category: "Work" },
        { day: "Friday", time: "13:00", duration: 4, activity: "Work :)", category: "Work" }
    ];

    workWeek.forEach(item => {
        let dayColumn = document.getElementById(item.day);
        let activityBlock = document.createElement("div");
        activityBlock.classList.add("activity-block", "activity-work");

        // Adjust height based on duration
        let durationInMinutes = item.duration * 60;
        activityBlock.style.height = `${durationInMinutes * (50 / 60)}px`; // Adjust height based on duration

        // Calculate the top position based on the start time
        let startTime = parseInt(item.time.split(':')[0]);
        let startMinutes = parseInt(item.time.split(':')[1]);
        let topPosition = ((startTime - 8) * 50) + (startMinutes * (50 / 60));
        activityBlock.style.top = `${topPosition}px`;

        activityBlock.textContent = `${item.activity}`;
        dayColumn.appendChild(activityBlock);

        // Make the activity block draggable and resizable
        interact(activityBlock)
            .draggable({
                onmove: dragMoveListener,
                onend: dragEndListener,
                restrict: {
                    restriction: ".calendar",
                    endOnly: true,
                    elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
                },
                snap: {
                    targets: [interact.createSnapGrid({ x: 0, y: 4.17 })], // Snap to 5-minute intervals
                    range: Infinity,
                    relativePoints: [{ x: 0, y: 0 }]
                },
                inertia: true
            })
            .resizable({
                edges: { top: false, left: false, bottom: true, right: false },
                restrictEdges: {
                    outer: 'parent',
                    endOnly: true,
                },
                restrictSize: {
                    min: { height: 50 },
                },
                inertia: true
            })
            .on('resizemove', function (event) {
                let target = event.target;
                let y = (parseFloat(target.getAttribute('data-y')) || 0);

                // Update the element's style
                target.style.height = event.rect.height + 'px';

                // Translate when resizing from top
                y += event.deltaRect.top;

                target.style.transform = 'translate(' + (parseFloat(target.getAttribute('data-x')) || 0) + 'px,' + y + 'px)';

                target.setAttribute('data-y', y);
            });

        // Adjust existing blocks to avoid overlap
        adjustBlocks(dayColumn);
    });
}

function removeActivity() {
    let activityInput = document.getElementById("activity").value.trim();
    let category = document.getElementById("category").value;
    let duration = parseFloat(document.getElementById("duration").value);

    if (activityInput && duration > 0) {
        // Find the index of the activity in the activities array
        let activityIndex = activities.findIndex(activity =>
            activity.name === activityInput &&
            activity.category === category &&
            activity.duration === duration
        );

        if (activityIndex !== -1) {
            // Remove the activity from the array
            activities.splice(activityIndex, 1);

            // Update the UI by removing the activity from the corresponding list
            let listId;
            switch (category) {
                case "Work":
                    listId = "work-list";
                    break;
                case "Exercise":
                    listId = "exercise-list";
                    break;
                case "Leisure":
                    listId = "leisure-list";
                    break;
                case "Other":
                    listId = "other-list";
                    break;
            }

            // Find and remove the corresponding list item
            let list = document.getElementById(listId);
            let listItems = Array.from(list.getElementsByTagName("li"));
            let listItem = listItems.find(item => item.textContent === `${activityInput} - (${duration} hrs)`);
            if (listItem) {
                list.removeChild(listItem);
            }

            // Clear the input fields
            document.getElementById("activity").value = "";
            document.getElementById("duration").value = "";
        } else {
            alert("Activity not found. Please ensure the details match exactly.");
        }
    } else {
        alert("Please fill in all fields correctly to remove an activity.");
    }
}

function generateSchedule() {
    fetch("/schedule", { // Use a relative URL
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activities: activities })
    })
    .then(response => response.json())
    .then(data => {
        let days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        let scheduleByDay = {};

        // Initialize scheduleByDay with empty arrays for each day
        days.forEach(day => {
            scheduleByDay[day] = [];
        });

        // Group activities by day
        data.schedule.forEach(item => {
            // Generate a unique ID for each activity if not already provided
            if (!item.id) {
                item.id = `${item.day}-${item.time}-${item.activity}`.replace(/\s+/g, '-');
            }
            scheduleByDay[item.day].push(item);
        });

        // Create the weekly calendar
        days.forEach(day => {
            let dayColumn = document.getElementById(day);

            scheduleByDay[day].forEach(item => {
                // Check if the event already exists
                let existingEvent = Array.from(dayColumn.getElementsByClassName('activity-block')).find(block => {
                    return block.getAttribute('data-id') === item.id;
                });

                if (!existingEvent) {
                    let activityBlock = document.createElement("div");
                    activityBlock.classList.add("activity-block");
                    activityBlock.setAttribute('data-id', item.id); // Set a unique identifier for the event

                    // Apply the appropriate CSS class based on the activity type
                    switch (item.category) {
                        case "Work":
                            activityBlock.classList.add("activity-work");
                            break;
                        case "Exercise":
                            activityBlock.classList.add("activity-exercise");
                            break;
                        case "Leisure":
                            activityBlock.classList.add("activity-leisure");
                            break;
                        case "Other":
                            activityBlock.classList.add("activity-other");
                            break;
                    }

                    // Adjust height based on duration
                    let durationInMinutes = item.duration * 60;
                    activityBlock.style.height = `${durationInMinutes * (50 / 60)}px`; // Adjust height based on duration

                    // Calculate the top position based on the start time
                    let startTime = parseInt(item.time.split(':')[0]);
                    let startMinutes = parseInt(item.time.split(':')[1]);
                    let topPosition = ((startTime - 8) * 50) + (startMinutes * (50 / 60));
                    activityBlock.style.top = `${topPosition}px`;

                    activityBlock.textContent = `${item.activity}`;
                    dayColumn.appendChild(activityBlock);

                    // Make the activity block draggable and resizable
                    interact(activityBlock)
                        .draggable({
                            onmove: dragMoveListener,
                            onend: dragEndListener,
                            restrict: {
                                restriction: ".calendar",
                                endOnly: true,
                                elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
                            },
                            snap: {
                                targets: [interact.createSnapGrid({ x: 0, y: 4.17 })], // Snap to 5-minute intervals
                                range: Infinity,
                                relativePoints: [{ x: 0, y: 0 }]
                            },
                            inertia: true
                        })
                        .resizable({
                            edges: { top: false, left: false, bottom: true, right: false },
                            restrictEdges: {
                                outer: 'parent',
                                endOnly: true,
                            },
                            restrictSize: {
                                min: { height: 50 },
                            },
                            inertia: true
                        })
                        .on('resizemove', function (event) {
                            let target = event.target;
                            let y = (parseFloat(target.getAttribute('data-y')) || 0);

                            // Update the element's style
                            target.style.height = event.rect.height + 'px';

                            // Translate when resizing from top
                            y += event.deltaRect.top;

                            target.style.transform = 'translate(' + (parseFloat(target.getAttribute('data-x')) || 0) + 'px,' + y + 'px)';

                            target.setAttribute('data-y', y);
                        });

                    // Adjust existing blocks to avoid overlap
                    adjustBlocks(dayColumn);
                }
            });
        });
    });
}

function resetSchedule() {
    let days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    days.forEach(day => {
        let dayColumn = document.getElementById(day);
        dayColumn.innerHTML = "";
    });
}

function adjustBlocks(dayColumn) {
    let blocks = Array.from(dayColumn.getElementsByClassName('activity-block'));
    blocks.sort((a, b) => parseFloat(a.style.top) - parseFloat(b.style.top));

    for (let i = 0; i < blocks.length - 1; i++) {
        let currentBlock = blocks[i];
        let nextBlock = blocks[i + 1];

        let currentBottom = parseFloat(currentBlock.style.top) + parseFloat(currentBlock.style.height);
        let nextTop = parseFloat(nextBlock.style.top);

        if (currentBottom > nextTop) {
            nextBlock.style.top = `${currentBottom}px`;
        }
    }
}

function dragMoveListener(event) {
    var target = event.target,
        // keep the dragged position in the data-x/data-y attributes
        x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
        y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    // Snap to 5-minute intervals (4.17 pixels)
    y = Math.round(y / 4.17) * 4.17;

    // translate the element
    target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';

    // update the position attributes
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
}

function dragEndListener(event) {
    var target = event.target;

    // Get the current transform values
    var transform = target.style.transform;
    var translateY = transform.match(/translate\(\d+px, (\d+(\.\d+)?)px\)/);

    if (translateY) {
        var y = parseFloat(translateY[1]);

        // Update the top position based on the transform
        target.style.top = y + 'px';

        // Reset the transform
        target.style.transform = 'translate(0px, 0px)';
        target.setAttribute('data-x', 0);
        target.setAttribute('data-y', y);
    }
}

// this is used later in the resizing and gesture demos
window.dragMoveListener = dragMoveListener;
window.dragEndListener = dragEndListener;

// Add event listener for the Export button
document.getElementById("export-btn").addEventListener("click", function () {
    html2canvas(document.body).then(canvas => {
        // Convert the canvas to a data URL
        const dataURL = canvas.toDataURL("image/jpeg", 1.0);

        // Create a temporary link element
        const link = document.createElement("a");
        link.href = dataURL;
        link.download = "calendar_screenshot.jpg";

        // Trigger the download
        link.click();
    }).catch(error => {
        console.error("Screenshot failed:", error);
    });
});