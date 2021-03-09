import moment from "moment";

class Utils {

    static formatDate(dateStr: string): string {
        const date = new Date(dateStr);

        return moment(date).format("YYYY MM DD");
    }

    static formatGender(gender: string): string {
        return gender.includes('F') ? 'Female' : 'Male';
    }

    static calculatePatientAge(patientDOB: string): number {
        const today = new Date();
        const dob = new Date(patientDOB);
        return today.getFullYear() - dob.getFullYear();
    }
}

export default Utils;
