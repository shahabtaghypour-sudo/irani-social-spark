export type Book = {
  id: string;
  title: string;
  author: string;
  category: string;
  year: number;
};

export const BOOK_CATEGORIES = [
  "All",
  "Poetry",
  "Philosophy",
  "Fiction",
  "Essays",
  "Art",
] as const;

export const BOOKS: Book[] = [
  { id: "1", title: "Smoke & Signal", author: "L. Farrow", category: "Poetry", year: 2021 },
  { id: "2", title: "The Free Reader", author: "N. Adell", category: "Essays", year: 2019 },
  { id: "3", title: "Porcelain Hours", author: "M. Ivry", category: "Fiction", year: 2023 },
  { id: "4", title: "Notes on Silence", author: "K. Rhode", category: "Philosophy", year: 2015 },
  { id: "5", title: "Rose Ash", author: "S. Delun", category: "Poetry", year: 2024 },
  { id: "6", title: "Marginalia", author: "T. Bell", category: "Essays", year: 2012 },
  { id: "7", title: "Lavender Rooms", author: "A. Norr", category: "Fiction", year: 2018 },
  { id: "8", title: "Ink & Iron", author: "J. Vasil", category: "Art", year: 2020 },
  { id: "9", title: "A Society of Readers", author: "P. Mane", category: "Philosophy", year: 2022 },
  { id: "10", title: "Paper Lanterns", author: "R. Sato", category: "Art", year: 2016 },
  { id: "11", title: "Quiet Rebellion", author: "D. Kaur", category: "Essays", year: 2025 },
  { id: "12", title: "The Last Edition", author: "H. Vogel", category: "Fiction", year: 2010 },
];
