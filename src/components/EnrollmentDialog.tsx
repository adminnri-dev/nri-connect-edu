import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CheckCircle } from "lucide-react";

const enrollmentSchema = z.object({
  studentName: z.string().min(2, "Student name is required").max(100),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  grade: z.string().min(1, "Please select a grade"),
  parentName: z.string().min(2, "Parent/Guardian name is required").max(100),
  email: z.string().email("Invalid email address").max(255),
  phone: z.string().min(10, "Valid phone number is required").max(15),
  address: z.string().min(10, "Address is required").max(500),
  previousSchool: z.string().max(200).optional(),
});

type EnrollmentFormData = z.infer<typeof enrollmentSchema>;

interface EnrollmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EnrollmentDialog = ({ open, onOpenChange }: EnrollmentDialogProps) => {
  const [submitted, setSubmitted] = useState(false);
  const [confirmationNumber, setConfirmationNumber] = useState("");

  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm<EnrollmentFormData>({
    resolver: zodResolver(enrollmentSchema),
  });

  const generateConfirmationNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `NRI${timestamp}${random}`.slice(0, 16);
  };

  const onSubmit = (data: EnrollmentFormData) => {
    console.log("Enrollment data:", data);
    const confNumber = generateConfirmationNumber();
    setConfirmationNumber(confNumber);
    setSubmitted(true);
  };

  const handleClose = () => {
    setSubmitted(false);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {!submitted ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">Enrollment Application</DialogTitle>
              <DialogDescription>
                Fill out the form below to start your enrollment process at NRI High School
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
              {/* Student Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Student Information</h3>
                
                <div>
                  <Label htmlFor="studentName">Student Full Name *</Label>
                  <Input
                    id="studentName"
                    {...register("studentName")}
                    placeholder="Enter student's full name"
                  />
                  {errors.studentName && (
                    <p className="text-sm text-destructive mt-1">{errors.studentName.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    {...register("dateOfBirth")}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-sm text-destructive mt-1">{errors.dateOfBirth.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="grade">Grade Applying For *</Label>
                  <Select onValueChange={(value) => setValue("grade", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nursery">Nursery</SelectItem>
                      <SelectItem value="lkg">LKG</SelectItem>
                      <SelectItem value="ukg">UKG</SelectItem>
                      <SelectItem value="1">Class 1</SelectItem>
                      <SelectItem value="2">Class 2</SelectItem>
                      <SelectItem value="3">Class 3</SelectItem>
                      <SelectItem value="4">Class 4</SelectItem>
                      <SelectItem value="5">Class 5</SelectItem>
                      <SelectItem value="6">Class 6</SelectItem>
                      <SelectItem value="7">Class 7</SelectItem>
                      <SelectItem value="8">Class 8</SelectItem>
                      <SelectItem value="9">Class 9</SelectItem>
                      <SelectItem value="10">Class 10</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.grade && (
                    <p className="text-sm text-destructive mt-1">{errors.grade.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="previousSchool">Previous School (Optional)</Label>
                  <Input
                    id="previousSchool"
                    {...register("previousSchool")}
                    placeholder="Enter previous school name"
                  />
                </div>
              </div>

              {/* Parent/Guardian Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Parent/Guardian Information</h3>
                
                <div>
                  <Label htmlFor="parentName">Parent/Guardian Full Name *</Label>
                  <Input
                    id="parentName"
                    {...register("parentName")}
                    placeholder="Enter parent/guardian name"
                  />
                  {errors.parentName && (
                    <p className="text-sm text-destructive mt-1">{errors.parentName.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="parent@example.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...register("phone")}
                    placeholder="+91 9999999999"
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="address">Residential Address *</Label>
                  <Input
                    id="address"
                    {...register("address")}
                    placeholder="Enter complete address"
                  />
                  {errors.address && (
                    <p className="text-sm text-destructive mt-1">{errors.address.message}</p>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full bg-gradient-hero hover:opacity-90">
                Submit Application
              </Button>
            </form>
          </>
        ) : (
          <div className="py-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="bg-accent/10 p-4 rounded-full">
                <CheckCircle className="w-16 h-16 text-accent" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-foreground">Application Submitted!</h3>
              <p className="text-muted-foreground">Thank you for your interest in NRI High School</p>
            </div>

            <div className="bg-muted/50 p-6 rounded-lg space-y-2">
              <p className="text-sm text-muted-foreground">Your Confirmation Number</p>
              <p className="text-3xl font-bold text-primary">{confirmationNumber}</p>
              <p className="text-sm text-muted-foreground">Please save this number for future reference</p>
            </div>

            <div className="space-y-2">
              <p className="text-foreground">
                Our admission team will review your application and reach out to you at the earliest.
              </p>
              <p className="text-sm text-muted-foreground">
                You will receive a confirmation email shortly.
              </p>
            </div>

            <Button onClick={handleClose} className="bg-gradient-secondary hover:opacity-90">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EnrollmentDialog;
