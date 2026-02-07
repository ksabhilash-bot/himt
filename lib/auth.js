import bcrypt from "bcryptjs";


const SALT_ROUNDS = 10;

export async function hashPassword(plainPassword) {
    try {
        const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);
        return hashedPassword;
    } catch (error) {
        console.error("Error hashing password:", error);
        throw new Error("Error hashing password");
    }
}

export async function verifyPassword(plainPassword, hashedPassword) {
    try {
        const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
        return isMatch;
    } catch (error) {
        console.error("Error verifying password:", error);
        throw new Error("Error verifying password");
        
    }
}

