import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CheckCircle } from "lucide-react";
import { toast } from "sonner";

const inquirySchema = z.object({
  parentName: z.string().min(2, "Parent name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  studentName: z.string().min(2, "Student name must be at least 2 characters"),
  gradeInterested: z.string().min(1, "Please select a grade"),
  message: z.string().optional(),
});

type InquiryFormData = z.infer<typeof inquirySchema>;

interface AdmissionInquiryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AdmissionInquiryDialog = ({ open, onOpenChange }: AdmissionInquiryDialogProps) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [confirmationNumber, setConfirmationNumber] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<InquiryFormData>({
    resolver: zodResolver(inquirySchema),
  });

  const onSubmit = (data: InquiryFormData) => {
    console.log("Inquiry submitted:", data);
    
    // Generate confirmation number
    const confNum = `INQ${Date.now().toString().slice(-8)}`;
    setConfirmationNumber(confNum);
    setIsSubmitted(true);
    
    toast.success("Inquiry submitted successfully!");
  };

  const handleClose = () => {
    setIsSubmitted(false);
    reset();
    onOpenChange(false);
  };

  if (isSubmitted) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-4 rounded-full bg-green-100 p-3">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <DialogTitle className="mb-2 text-2xl">Thank You!</DialogTitle>
            <DialogDescription className="mb-4 text-base">
              Your inquiry has been received successfully.
            </DialogDescription>
            <div className="mb-6 rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground mb-1">Confirmation Number</p>
              <p className="text-2xl font-bold text-primary">{confirmationNumber}</p>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Our admissions team will reach out to you at the earliest to discuss the next steps.
            </p>
            <Button onClick={handleClose} className="w-full">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Admission Inquiry</DialogTitle>
          <DialogDescription>
            Share your details and we'll get back to you with admission information
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parentName">Parent/Guardian Name *</Label>
                <Input
                  id="parentName"
                  {...register("parentName")}
                  placeholder="Enter full name"
                />
                {errors.parentName && (
                  <p className="text-sm text-destructive">{errors.parentName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="studentName">Student Name *</Label>
                <Input
                  id="studentName"
                  {...register("studentName")}
                  placeholder="Enter student name"
                />
                {errors.studentName && (
                  <p className="text-sm text-destructive">{errors.studentName.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="parent@example.com"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Contact Number *</Label>
                <Input
                  id="phone"
                  {...register("phone")}
                  placeholder="+91 9618139109"
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gradeInterested">Grade Interested In *</Label>
              <Select onValueChange={(value) => setValue("gradeInterested", value)}>
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
              {errors.gradeInterested && (
                <p className="text-sm text-destructive">{errors.gradeInterested.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Additional Message (Optional)</Label>
              <Textarea
                id="message"
                {...register("message")}
                placeholder="Any specific questions or requirements..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Submit Inquiry
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdmissionInquiryDialog;
