# Health and Wellness Products Web Application

This is a project for the Web Technologies III (CSD 3313) course. It's a full-stack web application for a health and wellness products store.

## Project Overview

This web application allows users to browse, search, and filter health and wellness products. Admin users can manage products through an admin dashboard. The application follows the MVC architecture and implements RESTful API services.

## Technologies Used

### Frontend
- HTML5
- CSS3
- JavaScript (ES6+)
- Responsive design

### Middleware
- Node.js
- Express.js
- RESTful API

### Backend
- MongoDB
- Mongoose ODM

## Features

- User authentication (login/registration)
- Product browsing and filtering
- Product details view
- Admin dashboard for product management
- CRUD operations for products
- Responsive design for mobile and desktop users
- Form validation

## Project Structure

```
wellness-store-project/
├── models/               # MongoDB models
│   ├── Product.js        # Product schema
│   └── User.js           # User schema
├── controllers/          # API controllers
│   ├── productController.js
│   └── userController.js
├── routes/               # API routes
│   ├── productRoutes.js
│   └── userRoutes.js
├── public/               # Frontend files
│   ├── index.html        # Home page
│   ├── products.html     # Products listing
│   ├── product-detail.html
│   ├── login.html
│   ├── register.html
│   ├── styles/           # CSS files
│   │   ├── main.css
│   │   └── admin.css
│   ├── js/               # JavaScript files
│   │   ├── main.js
│   │   ├── home.js
│   │   ├── products.js
│   │   ├── product-detail.js
│   │   ├── auth.js
│   │   └── admin.js
│   └── admin/            # Admin pages
│       └── manage-products.html
├── server.js             # Main server file
└── package.json
```

## Setup Instructions

1. Clone the repository:
```
git clone https://github.com/Sankalp-Sachapara/wellness-store-project.git
cd wellness-store-project
```

2. Install dependencies:
```
npm install
```

3. Set up MongoDB:
   - Make sure MongoDB is installed and running on your local machine
   - The default connection string in server.js is: `mongodb://localhost:27017/wellness_store`

4. Start the server:
```
npm start
```

5. Open your browser and navigate to:
```
http://localhost:3000
```

## API Endpoints

### Products
- GET `/api/products` - Get all products
- GET `/api/products/:id` - Get a single product by ID
- GET `/api/products/category/:category` - Get products by category
- POST `/api/products` - Create a new product
- PUT `/api/products/:id` - Update a product
- DELETE `/api/products/:id` - Delete a product

### Users
- POST `/api/users/register` - Register a new user
- POST `/api/users/login` - Login user
- GET `/api/users/profile/:id` - Get user profile
- PUT `/api/users/profile/:id` - Update user profile

## Contributors

- [Student Name]

## License

This project is created for educational purposes for the CSD 3313 course.
