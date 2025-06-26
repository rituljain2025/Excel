export interface PersonRecord {
  id: number;
  firstName: string;
  lastName: string;
  Age: number;
  Salary: number;
}

/**
 * Predefined list of sample names
 */
const firstNames = [
  "Raj", "Priya", "Aman", "Simran", "Kunal", "Neha", "Ankit", "Pooja", "Vikas", "Sneha",
  "Rahul", "Anjali", "Arjun", "Riya", "Nikhil", "Kavita", "Yash", "Divya", "Rohit", "Isha",
  "Karan", "Meena", "Aarav", "Tanya", "Vivek", "Naina", "Siddharth", "Sonam", "Aayush", "Radhika",
  "Dev", "Sheetal", "Manav", "Jaya", "Abhishek", "Bhavna", "Sameer", "Kriti", "Uday", "Kanika",
  "Rajat", "Nupur", "Hardik", "Payal", "Harsh", "Shruti", "Lakshya", "Reema", "Tushar", "Aditi",
  "Deepak", "Swati", "Saurabh", "Pallavi", "Aditya", "Mansi", "Keshav", "Preeti", "Viraj", "Garima",
  "Tarun", "Ritul", "Varun", "Charu", "Dhruv", "Ishita", "Ramesh", "Vidya", "Akhil", "Ayesha",
  "Kritika", "Sonal", "Naveen", "Tina", "Parth", "Juhi", "Nitin", "Alka", "Gaurav", "Anamika",
  "Shivam", "Trisha", "Kartik", "Ritu", "Hemant", "Asmita", "Puneet", "Lavanya", "Mayank", "Shalini",
  "Suraj", "Rachna", "Sanjeev", "Komal", "Deepesh", "Farah", "Mahesh", "Avni", "Arvind", "Neelam"
];

const lastNames = [
  "Sharma", "Verma", "Patel", "Mehta", "Joshi", "Yadav", "Reddy", "Rana", "Sinha", "Chopra",
  "Singh", "Kapoor", "Malhotra", "Saxena", "Agarwal", "Desai", "Thakur", "Prajapati", "Bansal", "Dubey",
  "Bhatt", "Jain", "Nair", "Choudhary", "Gupta", "Shukla", "Pandey", "Dutta", "Kulkarni", "Shetty",
  "Roy", "Nath", "Rawat", "Tripathi", "Das", "Tiwari", "Ghosh", "Pawar", "Naidu", "Kumar",
  "Pathak", "Chatterjee", "Rajput", "Basak", "Pal", "Banerjee", "Menon", "Rastogi", "Bhatia", "Kaul",
  "Mittal", "Mahajan", "Kaushik", "Gandhi", "Grover", "Sood", "Ahluwalia", "Bakshi", "Khanna", "Salvi",
  "Sawant", "Vohra", "Bedi", "Bora", "Rao", "Iqbal", "Mirza", "Ali", "Shah", "Jain",
  "Shaikh", "Ansari", "Rehman", "Sethi", "Sehgal", "Bhalla", "Sodhi", "Nanda", "Mehrotra", "Gulati",
  "Mathur", "Behl", "Suri", "Chhabra", "Dewan", "Luthra", "Narayan", "Iyer", "Nambiar", "Rajan",
  "Shukre", "Prasad", "Acharya", "Kuldeep", "Ojha", "Tyagi", "Upadhyay", "Pandit", "Modi", "Nene"
];

/**
 * Generate random integer between min and max(inclusive)
 */
function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 
 * @param count 
 * @returns 
 */
export function generateSampleData(count: number = 50000): PersonRecord[] {
  const data: PersonRecord[] = [];

  for (let i = 0; i < count; i++) {
    const firstName = firstNames[getRandomInt(0, firstNames.length - 1)];
    const lastName = lastNames[getRandomInt(0, lastNames.length - 1)];
    
    data.push({
      id: i + 1,
      firstName,
      lastName,
      Age: getRandomInt(20, 60),
      Salary: getRandomInt(30000, 2000000),
    });
  }

  return data;
}


