# Raw Material Inventory Management System

This web application is designed to efficiently manage the inventory of raw materials for a manufacturing unit. It provides a user-friendly interface for adding, modifying, and updating item details, managing incoming raw materials (inward), tracking issued materials (outward), and generating comprehensive reports.

## Table of Contents

* [Features](#features)

* [Database Schema](#database-schema)

* [Technologies Used](#technologies-used)

* [Setup and Installation](#setup-and-installation)

  * [Database Configuration](#database-configuration)

  * [Running the Application](#running-the-application)

* [Usage](#usage)

  * [Item Management](#item-management)

  * [Item Received (Inward)](#item-received-inward)

  * [Item Issue (Outward)](#item-issue-outward)

  * [Item Report](#item-report)

* [Project Structure](#project-structure)

* [Project Status](#project-status)

* [Screen-Recorded Video](#screen-recorded-video)

* [Useful Links and Resources](#useful-links-and-resources)

* [Contributing](#contributing)

* [License](#license)

## Features

The application is structured around a dashboard with a common header, footer, and a left navigation menu, allowing seamless navigation between its core functionalities:

### 1. Item Management Page

This form facilitates the addition of new raw materials and the modification of existing item details.

* **Item ID:** Users can enter an Item ID. If the ID exists in the database, the form will pre-populate with the item's current details for editing. If it's a new ID, the user will be prompted to enter new item information.

* **Item Name:** Text field for the name of the raw material.

* **Opening Stock:** Numeric field, allowing up to 15 total digits with 3 decimal places, representing the initial stock quantity.

* **Unit of Measurement (UoM):** Text field for the unit, allowing up to 10 characters (e.g., KG, LTR, PCS).

* **Control Buttons:** Includes functionalities for saving, editing, and resetting the form, along with necessary field validations.

### 2. Item Received (Inward) Page

This form is used to record and manage raw materials received into the store.

* **Receipt No:** If an existing receipt number is entered, the form loads its details for further actions. Otherwise, it allows for a new receipt entry.

* **Receipt Date:** Date picker for the material receipt date. No future date entry is allowed.

* **Item ID:** Must correspond to an existing Item ID in the `ITEMS` relation. Upon valid entry, the corresponding Item Name is displayed. An error message "Item not present" appears if the ID is invalid, and the cursor remains on the Item ID field.

* **Quantity Received:** Numeric field for the quantity of material received.

* **Control Buttons:** Provides options to save, edit, and reset inward entries, with validations and automatic stock updates.

### 3. Item Issue (Outward) Page

This form manages the issuance of raw materials from the store for manufacturing purposes.

* **Issue No:** Similar to Receipt No, existing issue numbers can be loaded for modification, or new entries can be created.

* **Issue Date:** Date picker for the material issue date. No future date entry is allowed.

* **Item ID:** Must correspond to an existing Item ID in the `ITEMS` relation, displaying the Item Name upon valid entry. An error message "Item not present" is shown for invalid IDs, keeping the cursor on the field.

* **Quantity Issued:** Numeric field for the quantity of material issued. Includes validation to ensure the entered quantity does not exceed the `AvailableStock`, displaying "Quantity entered is more than available" and keeping the cursor on the quantity field if invalid.

* **Control Buttons:** Offers functionalities to save, edit, and reset outward entries, including validations and stock adjustments.

### 4. Item Report Page

This page generates and displays a tabular report of items based on a specified range of Item IDs.

* **Filter Options:** Allows users to specify an optional "Item ID From" and "Item ID To" to filter the report.

  * If both fields are left blank, the report will display all available items.

  * If only "Item ID From" is provided, the report will include all items from that ID onwards.

  * If only "Item ID To" is provided, the report will include all items up to that ID.

* **Report Columns:** The report includes:

  * Item ID

  * Item Name

  * Current Stock (Available Stock)

  * Unit of Measure

  * Opening Stock

  * Items Received

  * Items Issued

## Database Schema

The application interacts with a database consisting of three relations (tables) to manage raw material inventory:

* **`ITEMS`**

  * `ItemID` (Primary Key): Unique identifier for each item.

  * `ItemName`: Name of the raw material.

  * `OpeningStock`: Initial stock quantity of the item.

  * `ItemsReceived`: Total quantity of items received to date.

  * `ItemsIssued`: Total quantity of items issued to date.

  * `AvailableStock`: Current stock quantity (calculated: `OpeningStock + ItemsReceived - ItemsIssued`).

  * `UoM`: Unit of Measurement (e.g., KG, LTR).

* **`INWARD`**

  * `ReceiptNo` (Primary Key): Unique identifier for each receipt transaction.

  * `ReceiptDate`: Date of the item receipt.

  * `ItemID` (Foreign Key): References `ItemID` in the `ITEMS` relation.

  * `QtyReceived`: Quantity of the item received in this transaction.

* **`OUTWARD`**

  * `IssueNo` (Primary Key): Unique identifier for each issue transaction.

  * `IssueDate`: Date of the item issue.

  * `ItemID` (Foreign Key): References `ItemID` in the `ITEMS` relation.

  * `QtyIssued`: Quantity of the item issued in this transaction.

## Technologies Used

This project leverages a combination of front-end technologies for a responsive and interactive user experience, and a custom backend interaction method for data persistence.

* **HTML5:** For structuring the web pages.

* **CSS3 (with AdminLTE and Bootstrap):** For styling and layout.

  * **AdminLTE 3.x:** A popular open-source Admin control panel and dashboard template, providing the overall dashboard structure, navigation, and many UI components.

  * **Bootstrap 4.x:** A widely used CSS framework for responsive design and common UI elements.

* **JavaScript (with jQuery):** For front-end interactivity, form validations, and dynamic content updates.

  * **jQuery:** A fast, small, and feature-rich JavaScript library.

* **Font Awesome 6.x:** For scalable vector icons.

* **JPDB (Probable Database Interaction):** Based on the JavaScript files, the application uses a custom `executeCommandAtGivenBaseUrl` function, suggesting interaction with a specific database API, likely `JPDB`. This involves sending authenticated requests (`TOKEN`) to a defined base URL (`JPDB_BASE_URL`) for database operations (`DB_NAME`, `ITEMS_REL`, `INWARD_REL`, `OUTWARD_REL`).

## Setup and Installation

To set up and run this project, you will need a web server (e.g., Apache, Nginx, or a simple Python HTTP server) to serve the HTML, CSS, and JavaScript files. The application relies on external CDN links for AdminLTE, Bootstrap, Font Awesome, and jQuery, so an internet connection is required for initial loading.

### Database Configuration

The application interacts with a database using a custom API. To make this application work with your own database or a similar setup, you will need to configure the following global JavaScript variables (likely defined in a central `js/config.js` or directly in your main `index.html` or similar files, though not explicitly provided in the snippets):

* `TOKEN`: Your authentication token for the database API.

* `DB_NAME`: The name of your database.

* `JPDB_BASE_URL`: The base URL for your database's API endpoints. (Eg. http://api.login2explore.com:5577)

* `ITEMS_REL`: The name of your `ITEMS` relation/table.

* `INWARD_REL`: The name of your `INWARD` relation/table.

* `OUTWARD_REL`: The name of your `OUTWARD` relation/table.


### Running the Application

1. **Clone the Repository:**

```bash
   git clone https://github.com/jatin-003/inventory-management-system.git
   ```


2. **Configure Database Parameters:**
Open the JavaScript files (e.g., `item-management.js`, `item-inward.js`, `item-outward.js`, `item-report.js`) and ensure the `TOKEN`, `DB_NAME`, `JPDB_BASE_URL`, `ITEMS_REL`, `INWARD_REL`, and `OUTWARD_REL` variables are correctly defined and point to your database setup. If you are using a separate `config.js` file, ensure it's properly linked in `index.html`.

3. **Serve the Files:**
You can use a simple HTTP server. For example, with Python:

python -m http.server 8000


Then, open your web browser and navigate to `http://localhost:8000/index.html`.

## Usage

Upon launching the application, you will see a dashboard. Use the left navigation menu to access different functionalities:

### Item Management

1. Click "Item Management" in the sidebar.

2. **To Add a New Item:** Enter a unique `Item ID`. If it doesn't exist, the `Item Name`, `Opening Stock`, and `Unit of Measurement` fields will become editable. Fill in the details and click "Save".

3. **To Edit an Existing Item:** Enter an existing `Item ID`. The form will automatically populate with the item's details. Modify the necessary fields and click "Edit".

4. Use "Reset" to clear the form.

### Item Received (Inward)

1. Click "Item Received (Inward)" in the sidebar.

2. **To Add a New Inward Entry:** Enter a unique `Receipt No`. Fill in the `Receipt Date`, existing `Item ID` (the item name will appear if valid), and `Quantity Received`. Click "Save".

3. **To Edit an Existing Inward Entry:** Enter an existing `Receipt No`. The form will load the existing details. Modify the `Receipt Date`, `Item ID`, or `Quantity Received` as needed and click "Edit".

4. Use "Reset" to clear the form.

### Item Issue (Outward)

1. Click "Item Issued (Outward)" in the sidebar.

2. **To Add a New Outward Entry:** Enter a unique `Issue No`. Fill in the `Issue Date`, existing `Item ID` (item name and current available stock will be displayed), and `Quantity Issued`. Ensure `Quantity Issued` does not exceed `Available Stock`. Click "Save".

3. **To Edit an Existing Outward Entry:** Enter an existing `Issue No`. The form will load the existing details. Modify the `Issue Date`, `Item ID`, or `Quantity Issued` as needed and click "Edit".

4. Use "Reset" to clear the form.

### Item Report

1. Click "Item Report" in the sidebar.

2. Enter an optional `Item ID From` and `Item ID To` to filter the report by a range of item IDs.

3. Click "Generate Report". A table will display items matching your criteria, showing their ID, Name, Current Stock, UoM, Opening Stock, Items Received, and Items Issued.

## Project Structure

The project is organized as follows:

```
.
├── index.html              # Main dashboard page
├── inward.html             # Content for the Item Received (Inward) form
├── item.html               # Content for the Item Management form
├── outward.html            # Content for the Item Issue (Outward) form
├── report.html             # Content for the Item Report page
└── css/
├── style.css               # Custom CSS for general styling
└── js/
├── item-inward.js      # JavaScript for Item Received (Inward) logic
├── item-management.js  # JavaScript for Item Management logic
├── item-outward.js     # JavaScript for Item Issue (Outward) logic
└── item-report.js      # JavaScript for Item Report generation logic

```

## Project Status

The project is currently **Complete and Functional**. It provides all the outlined features for managing raw material inventory.

## Screen-Recorded Video

A screen-recorded video showcasing the working functionalities of this application is available. This video provides a visual demonstration of the user interface and how each feature operates, offering a practical understanding of the system in action. This also serves as an illustration of the project's capabilities.

[![Watch Demo Video](https://img.youtube.com/vi/MsHsKzqJxnE/maxresdefault.jpg)](https://youtu.be/MsHsKzqJxnE)

Click the image above to watch the demo video showcasing all the features of the Raw Material Inventory Management System.

## Useful Links and Resources

Here are some important links and resources related to this project:

* **Home page:** `https://login2explore.com`

* **Register to use JsonPowerDB:** `http://api.login2explore.com`

* **JsonPowerDB Help:** `https://login2explore.com/jpdb/docs.html`

## Contributing

Contributions are welcome! If you have suggestions for improvements or new features, please feel free to:

1. Fork the repository.

2. Create a new branch (`git checkout -b feature/YourFeature`).

3. Make your changes.

4. Commit your changes (`git commit -m 'Add new feature'`).

5. Push to the branch (`git push origin feature/YourFeature`).

6. Open a Pull Request.

## License

This project is open-source and available under the [MIT License](LICENSE.md)
