# Registration Troubleshooting Guide 🔧

## Common Registration Issues & Solutions

### ❌ **Most Common Issues:**

#### 1. **Phone Number Format**
- **Wrong**: `+254 712 345 678` (with spaces)
- **Wrong**: `0712345678` (without country code)
- **Correct**: `+254712345678` (no spaces, with country code)

#### 2. **Password Requirements**
- **Minimum**: 6 characters
- **Must contain**: 
  - At least one lowercase letter (a-z)
  - At least one uppercase letter (A-Z)  
  - At least one number (0-9)
- **Examples**:
  - ✅ `Test123!`
  - ✅ `Password1`
  - ✅ `MyPass2`
  - ❌ `password` (no uppercase, no number)
  - ❌ `PASSWORD` (no lowercase, no number)
  - ❌ `Test` (too short, no number)

#### 3. **Required Fields**
All fields are required:
- First Name (2-50 characters)
- Last Name (2-50 characters)
- Email (valid format)
- Password (requirements above)
- Phone (international format)
- ID Number (any format, max 50 characters)

## ✅ **Test Registration Data**

Use these exact values to test registration:

```
First Name: John
Last Name: Doe
Email: john.doe@example.com
Password: Test123!
Confirm Password: Test123!
Phone: +254712345678
ID Number: 12345678
```

## 🔍 **Debugging Steps**

1. **Check Browser Console**:
   - Press F12 in your browser
   - Go to Console tab
   - Look for any error messages

2. **Check Network Tab**:
   - Press F12 in your browser
   - Go to Network tab
   - Try registration
   - Look for the registration request and response

3. **Common Error Messages**:
   - `"Please provide a valid phone number"` → Remove spaces from phone number
   - `"Password must contain..."` → Check password requirements
   - `"Email already exists"` → Try a different email address

## 🧪 **Quick Test**

1. Go to: http://localhost:3001/register
2. Fill form with test data above
3. Click "Create Account"
4. Should redirect to guest dashboard

## 📞 **Still Having Issues?**

If registration still fails:

1. **Check both servers are running**:
   - Frontend: http://localhost:3001
   - Backend: http://localhost:5000/api/health

2. **Try different email**: The email might already exist in the database

3. **Clear browser data**: Clear localStorage and cookies

4. **Check browser console**: Look for detailed error messages