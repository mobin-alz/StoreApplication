# Store Application - فروشگاه آنلاین

A comprehensive e-commerce web application built with Spring Boot, featuring a modern Persian/English bilingual interface with complete shopping functionality.

یک اپلیکیشن فروشگاه آنلاین جامع ساخته شده با Spring Boot، دارای رابط کاربری دو زبانه فارسی/انگلیسی مدرن با قابلیت‌های کامل خرید.

---

## 🌟 Features - ویژگی‌ها

### Core Features - ویژگی‌های اصلی

-   **🛒 Complete Shopping Experience** - تجربه خرید کامل

    -   Product catalog with categories - کاتالوگ محصولات با دسته‌بندی
    -   Shopping cart functionality - عملکرد سبد خرید
    -   Wishlist management - مدیریت لیست علاقه‌مندی‌ها
    -   Order processing and tracking - پردازش و پیگیری سفارش

-   **👤 User Management** - مدیریت کاربران

    -   User registration and authentication - ثبت‌نام و احراز هویت کاربر
    -   Role-based access control (User, Admin, Provider) - کنترل دسترسی مبتنی بر نقش
    -   JWT-based secure authentication - احراز هویت امن مبتنی بر JWT

-   **🛡️ Admin Dashboard** - داشبورد مدیریت

    -   Product management - مدیریت محصولات
    -   User management - مدیریت کاربران
    -   Order management - مدیریت سفارشات
    -   Message management - مدیریت پیام‌ها

-   **💳 Payment Integration** - یکپارچه‌سازی پرداخت

    -   ZarinPal payment gateway - درگاه پرداخت زرین‌پال
    -   Secure payment processing - پردازش امن پرداخت

-   **🌐 Bilingual Support** - پشتیبانی دو زبانه
    -   Persian (Farsi) interface - رابط کاربری فارسی
    -   English interface - رابط کاربری انگلیسی
    -   RTL support for Persian - پشتیبانی راست به چپ برای فارسی

---

## 🛠️ Technology Stack - پشته فناوری

### Backend - بک‌اند

-   **Java 21** - جاوا 21
-   **Spring Boot 3.5.4** - اسپرینگ بوت 3.5.4
-   **Spring Security** - اسپرینگ سکیوریتی
-   **Spring Data JPA** - اسپرینگ دیتا جی‌پی‌ای
-   **PostgreSQL** - پست‌گرس‌کیوال
-   **JWT Authentication** - احراز هویت جی‌دبلیو‌تی

### Frontend - فرانت‌اند

-   **Thymeleaf** - تایم‌لیف
-   **HTML5 & CSS3** - اچ‌تی‌ام‌ال 5 و سی‌اس‌اس 3
-   **JavaScript (ES6+)** - جاوااسکریپت
-   **Bootstrap** - بوت‌استرپ
-   **Font Awesome** - فونت آوسام

### DevOps & Tools - دواپس و ابزارها

-   **Docker & Docker Compose** - داکر و داکر کامپوز
-   **Maven** - میون
-   **Swagger/OpenAPI** - سوگر/اوپن‌ای‌پی‌آی
-   **Lombok** - لامبوک

---

## 🚀 Quick Start - شروع سریع

### Prerequisites - پیش‌نیازها

-   Java 21 or higher - جاوا 21 یا بالاتر
-   Maven 3.6+ - میون 3.6 یا بالاتر
-   Docker & Docker Compose - داکر و داکر کامپوز
-   Git - گیت

### Installation - نصب

1. **Clone the repository** - کلون کردن مخزن

    ```bash
    git clone https://github.com/yourusername/StoreApplication.git
    cd StoreApplication
    ```

2. **Start the database** - راه‌اندازی پایگاه داده

    ```bash
    docker-compose up -d
    ```

3. **Configure the application** - پیکربندی اپلیکیشن

    - Update `src/main/resources/application.properties` if needed
    - تنظیمات `src/main/resources/application.properties` را در صورت نیاز تغییر دهید

4. **Run the application** - اجرای اپلیکیشن

    ```bash
    ./mvnw spring-boot:run
    # Or on Windows:
    mvnw.cmd spring-boot:run
    ```

5. **Access the application** - دسترسی به اپلیکیشن
    - Application: http://localhost:8080
    - API Documentation: http://localhost:8080/swagger-ui.html
    - Admin Panel: http://localhost:8080/dashboard

### Default Credentials - اعتبارنامه‌های پیش‌فرض

-   **Admin Username**: admin
-   **Admin Password**: admin123
-   **Database**: StoreApplicationDB (PostgreSQL)

---

## 📁 Project Structure - ساختار پروژه

```
src/
├── main/
│   ├── java/com/storeapplication/
│   │   ├── config/          # Configuration classes
│   │   ├── controller/      # REST and Web controllers
│   │   ├── dto/            # Data Transfer Objects
│   │   ├── filter/         # Security filters
│   │   ├── models/         # JPA entities
│   │   ├── repository/     # Data access layer
│   │   ├── services/       # Business logic layer
│   │   └── utils/          # Utility classes
│   └── resources/
│       ├── static/         # Static resources (CSS, JS, images)
│       └── templates/      # Thymeleaf templates
└── test/                   # Test classes
```

---

## 🔧 Configuration - پیکربندی

### Database Configuration - پیکربندی پایگاه داده

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/StoreApplicationDB
spring.datasource.username=postgres
spring.datasource.password=postgres
```

### File Upload Configuration - پیکربندی آپلود فایل

```properties
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```

---

## 🎯 API Endpoints - نقاط پایانی API

### Authentication - احراز هویت

-   `POST /api/auth/login` - User login
-   `POST /api/auth/register` - User registration
-   `POST /api/auth/logout` - User logout

### Products - محصولات

-   `GET /api/products` - Get all products
-   `GET /api/products/{id}` - Get product by ID
-   `POST /api/products` - Create product (Admin)
-   `PUT /api/products/{id}` - Update product (Admin)
-   `DELETE /api/products/{id}` - Delete product (Admin)

### Categories - دسته‌بندی‌ها

-   `GET /api/categories` - Get all categories
-   `POST /api/categories` - Create category (Admin)

### Orders - سفارشات

-   `GET /api/orders` - Get user orders
-   `POST /api/orders` - Create new order
-   `GET /api/orders/{id}` - Get order details

### Shopping Cart - سبد خرید

-   `GET /api/cart` - Get cart items
-   `POST /api/cart/add` - Add item to cart
-   `PUT /api/cart/update` - Update cart item
-   `DELETE /api/cart/remove/{id}` - Remove item from cart

---

## 🌐 Frontend Pages - صفحات فرانت‌اند

### Public Pages - صفحات عمومی

-   **Home** (`/`) - صفحه اصلی
-   **Products** (`/products`) - محصولات
-   **Categories** (`/categories`) - دسته‌بندی‌ها
-   **Product Detail** (`/product/{id}`) - جزئیات محصول
-   **About** (`/about`) - درباره ما
-   **Contact** (`/contact`) - تماس با ما

### User Pages - صفحات کاربر

-   **Login** (`/login`) - ورود
-   **Register** (`/register`) - ثبت‌نام
-   **Shopping Cart** (`/cart`) - سبد خرید
-   **Wishlist** (`/wishlist`) - لیست علاقه‌مندی‌ها
-   **Checkout** (`/checkout`) - تسویه حساب
-   **Order History** (`/orders`) - تاریخچه سفارشات

### Admin Pages - صفحات مدیریت

-   **Dashboard** (`/dashboard`) - داشبورد
-   **Product Management** (`/dashboard/products`) - مدیریت محصولات
-   **User Management** (`/dashboard/users`) - مدیریت کاربران
-   **Order Management** (`/dashboard/orders`) - مدیریت سفارشات
-   **Message Management** (`/dashboard/messages`) - مدیریت پیام‌ها

---

## 🔒 Security Features - ویژگی‌های امنیتی

-   **JWT Token Authentication** - احراز هویت توکن JWT
-   **Password Encryption** - رمزگذاری رمز عبور
-   **Role-based Access Control** - کنترل دسترسی مبتنی بر نقش
-   **CORS Configuration** - پیکربندی CORS
-   **Input Validation** - اعتبارسنجی ورودی
-   **SQL Injection Protection** - محافظت در برابر تزریق SQL

---

## 🧪 Testing - تست

### Run Tests - اجرای تست‌ها

```bash
./mvnw test
# Or on Windows:
mvnw.cmd test
```

### Test Coverage - پوشش تست

-   Unit tests for services - تست‌های واحد برای سرویس‌ها
-   Integration tests for controllers - تست‌های یکپارچگی برای کنترلرها
-   Security tests - تست‌های امنیتی

---

## 🐳 Docker Support - پشتیبانی داکر

### Using Docker Compose - استفاده از داکر کامپوز

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f
```

### Database Container - کانتینر پایگاه داده

-   **Image**: PostgreSQL 15
-   **Port**: 5432
-   **Database**: StoreApplicationDB
-   **Username**: postgres
-   **Password**: postgres

---

## 📊 Monitoring & Documentation - نظارت و مستندات

### Swagger/OpenAPI - سوگر/اوپن‌ای‌پی‌آی

-   **Swagger UI**: http://localhost:8080/swagger-ui.html
-   **API Docs**: http://localhost:8080/api-docs

### Application Monitoring - نظارت اپلیکیشن

-   **Health Check**: http://localhost:8080/actuator/health
-   **Metrics**: http://localhost:8080/actuator/metrics

---

## 🤝 Contributing - مشارکت

We welcome contributions! Please follow these steps:

مشارکت شما را خوشامد می‌گوییم! لطفاً این مراحل را دنبال کنید:

1. Fork the repository - فورک کردن مخزن
2. Create a feature branch - ایجاد شاخه ویژگی
3. Make your changes - ایجاد تغییرات
4. Add tests for new features - اضافه کردن تست برای ویژگی‌های جدید
5. Submit a pull request - ارسال درخواست کشیدن

---

## 👥 Authors - نویسندگان

-   **Mobin Alizadeh** - [@Mobin Alizadeh](https://github.com/mobin-alz)
-   **Mohammad Mehriyari** - [@MohammadMehriyari](https://github.com/MohammadMehriyari)

---

## 🙏 Acknowledgments - تشکر و قدردانی

-   Spring Boot team for the amazing framework
-   PostgreSQL team for the robust database
-   All open-source contributors who made this project possible

-   تیم Spring Boot برای فریمورک فوق‌العاده
-   تیم PostgreSQL برای پایگاه داده قدرتمند
-   تمام مشارکت‌کنندگان منبع باز که این پروژه را ممکن ساختند

---

## 📞 Support - پشتیبانی

If you have any questions or need help, please:

اگر سوالی دارید یا به کمک نیاز دارید، لطفاً:

-   Open an issue on GitHub

-   یک issue در GitHub باز کنید
-   با ما در your-email@example.com تماس بگیرید

---

**Made with ❤️ using Spring Boot**

**ساخته شده با ❤️ با استفاده از Spring Boot**
