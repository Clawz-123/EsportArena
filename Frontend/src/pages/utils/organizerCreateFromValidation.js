import * as Yup from "yup";

// Validation schema for creating tournament
export const tournamentValidationSchema = Yup.object().shape({
  name: Yup.string()
    .required("Tournament name is required")
    .min(3, "Tournament name must be at least 3 characters")
    .max(255, "Tournament name cannot exceed 255 characters"),
  
  gameTitle: Yup.string()
    .required("Game title is required")
    .oneOf(["PUBG Mobile", "Free Fire"], "Invalid game title"),
  
  matchFormat: Yup.string()
    .required("Match format is required")
    .oneOf(["Solo", "Duo", "Squad"], "Invalid match format"),
  
  description: Yup.string()
    .required("Tournament description is required")
    .test('word-count', 'Description must contain at least 50 words', function(value) {
      if (!value) return false;
      const wordCount = value.trim().split(/\s+/).length;
      return wordCount >= 50;
    })
    .max(1000, "Description cannot exceed 1000 characters"),
  
  registrationStart: Yup.date()
    .required("Registration start date is required")
    .typeError("Invalid date format")
    .min(new Date(new Date().setDate(new Date().getDate() - 1)), "Start date cannot be in the past"),
  
  registrationEnd: Yup.date()
    .required("Registration end date is required")
    .typeError("Invalid date format")
    .min(
      Yup.ref("registrationStart"),
      "Registration end date must be after start date"
    ),
  
  matchStart: Yup.date()
    .required("Match start date is required")
    .typeError("Invalid date format")
    .min(
      Yup.ref("registrationEnd"),
      "Match start date must be after registration end date"
    ),
  
  expectedEnd: Yup.date()
    .nullable()
    .typeError("Invalid date format")
    .min(
      Yup.ref("matchStart"),
      "Expected end date must be after match start date"
    ),
  
  maxParticipants: Yup.number()
    .required("Maximum teams is required")
    .typeError("Maximum teams must be a number")
    .integer("Maximum teams must be a whole number")
    .min(1, "Maximum teams must be at least 1"),
  
  entryFee: Yup.number()
    .required("Entry fee is required")
    .typeError("Entry fee must be a number")
    .min(0, "Entry fee cannot be negative"),
  
  prizeFirst: Yup.number()
    .required("First place prize is required")
    .typeError("Prize must be a number")
    .min(0, "Prize cannot be negative"),
  
  prizeSecond: Yup.number()
    .required("Second place prize is required")
    .typeError("Prize must be a number")
    .min(0, "Prize cannot be negative"),
  
  prizeThird: Yup.number()
    .required("Third place prize is required")
    .typeError("Prize must be a number")
    .min(0, "Prize cannot be negative"),
  
  matchRules: Yup.string()
    .max(2000, "Match rules cannot exceed 2000 characters"),
  
  autoStartTournament: Yup.boolean(),
});
