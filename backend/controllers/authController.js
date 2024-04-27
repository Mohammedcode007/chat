const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { sendEmail } = require('../middleware/sendingotp'); // Update the path accordingly

const { generateToken } = require('../Utils/authUtils');
exports.signup = async (req, res) => {
    const { username, password } = req.body;
    try {
        // Check if username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ 
                message_en: 'Username already exists',
                message_ar: 'اسم المستخدم موجود بالفعل'
            });
        }

        // Password complexity requirements
        const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ 
                message_en: 'Password must be at least 6 characters long and contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character',
                message_ar: 'يجب أن تكون كلمة المرور على الأقل 6 أحرف وتحتوي على حرف صغير وحرف كبير ورقم ورمز خاص'
            });
        }

        // Check if password and username meet the length requirements
        if (password.length < 6) {
            return res.status(400).json({ 
                message_en: 'Password must be at least 6 characters long',
                message_ar: 'يجب أن تكون كلمة المرور على الأقل 6 أحرف'
            });
        }

        if (username.length < 6 || username.length > 40) {
            return res.status(400).json({ 
                message_en: 'Username must be between 6 and 40 characters long',
                message_ar: 'يجب أن يكون اسم المستخدم بين 6 و 40 حرفًا'
            });
        }

        // Check if username contains non-English characters
        const usernameRegex = /^[a-zA-Z0-9!@#$%^&*()_+{}\[\]:;<>,.?/|\\'"~-]{6,40}$/;
        if (!usernameRegex.test(username)) {
            return res.status(400).json({ 
                message_en: 'Username must only contain English letters, numbers, and the following special characters: ! @ # $ % ^ & * ( ) _ + { } [ ] : ; < > , . ? / | \ \' " ~',
                message_ar: 'يجب أن يحتوي اسم المستخدم فقط على الأحرف الإنجليزية والأرقام والرموز الخاصة المحددة'
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if image data is provided in the request
        let image;
        if (req.file) {
            image = req.file.path; // Assuming you're using multer or similar middleware for handling file uploads
        }

        // Create a new user instance
        const newUser = new User({ 
            username, 
            password: hashedPassword,
            image // Add the image field to the user object
        });

        // Save the user to the database
        await newUser.save();

        // Sending response with user data
        res.status(201).json({ 
            message_en: 'Signup successful', 
            message_ar: 'تم التسجيل بنجاح', 
            user: newUser 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};





exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ 
                message_en: 'Username not found',
                message_ar: 'اسم المستخدم غير موجود'
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                message_en: 'Incorrect password',
                message_ar: 'كلمة المرور غير صحيحة'
            });
        }

        // Generate a token upon successful login
        const token = generateToken(user.id);

        // Fetch user's friends with their details
        const userWithFriends = await User.findById(user.id).populate('friends');

        // Sending user data with friends' usernames
        res.status(200).json({ 
            message_en: 'Login successful', 
            message_ar: 'تم تسجيل الدخول بنجاح', 
            user: userWithFriends, 
            token 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
