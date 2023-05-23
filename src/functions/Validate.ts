export function validateText(string: string): string | null {
    let validatedString;
    const reg = new RegExp("^(?! )[A-Za-z0-9 ]*(?<! )$");
    
    if (reg.test(string)) {
        validatedString = string.replace(/\s\s+/g, " ");

        return validatedString;
    } else {
        return null;
    }
}