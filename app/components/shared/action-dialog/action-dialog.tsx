import { useForm } from "@tanstack/react-form";
import { AlertTriangleIcon } from "lucide-react";
import React from "react";
import z from "zod";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Spinner } from "~/components/ui/spinner";

type ActionDialogContextType<ActionType extends string | null = string | null> =
  {
    open: ActionType;
    setOpen: (action: ActionType) => void;
    loading: ActionType | null;
  };

const ActionDialogContext = React.createContext<ActionDialogContextType | null>(
  null
);

const useActionDialog = () => {
  const context = React.useContext(ActionDialogContext);
  if (!context) {
    throw new Error("useActionDialog must be used within an ActionDialog");
  }
  return context;
};

function ActionDialog<ActionType extends string | null>({
  children,
  loading = null as ActionType | null,
  open = null as ActionType | null,
  setOpen,
}: React.PropsWithChildren<{
  loading?: ActionType | null;
  open: ActionType | null;
  setOpen: (action: ActionType | null) => void;
}>) {
  return (
    <ActionDialogContext.Provider
      value={
        { open, setOpen, loading } as ActionDialogContextType<string | null>
      }
    >
      {children}
    </ActionDialogContext.Provider>
  );
}

interface BaseActionDialogContentProps {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
}

function ActionDialogTrigger({
  action,
  ...props
}: React.ComponentProps<typeof Button> & {
  action: string;
}) {
  const { setOpen } = useActionDialog();

  return <Button onClick={() => setOpen(action)} {...props} />;
}

function ConfirmActionDialogContent({
  variant = "default",
  title,
  description,
  confirmText = "Continue",
  cancelText = "Cancel",
  action,
  onConfirm,
}: {
  action: string;
  variant?: "default" | "destructive";
  onConfirm: () => void;
} & BaseActionDialogContentProps &
  React.ComponentProps<typeof Button>) {
  const { loading, open, setOpen } = useActionDialog();

  const CompProvider = variant === "default" ? Dialog : AlertDialog;
  const CompRoot = variant === "default" ? DialogContent : AlertDialogContent;
  const CompHeader = variant === "default" ? DialogHeader : AlertDialogHeader;
  const CompTitle = variant === "default" ? DialogTitle : AlertDialogTitle;
  const CompDescription =
    variant === "default" ? DialogDescription : AlertDialogDescription;
  const CompFooter = variant === "default" ? DialogFooter : AlertDialogFooter;
  const CompCancel = variant === "default" ? DialogClose : AlertDialogCancel;

  return (
    <CompProvider
      open={open === action}
      onOpenChange={(open) => setOpen(open ? action : null)}
    >
      <CompRoot>
        <CompHeader>
          <CompTitle>{title}</CompTitle>
          <CompDescription>{description}</CompDescription>
        </CompHeader>
        <CompFooter>
          <CompCancel asChild>
            <Button variant="outline">{cancelText}</Button>
          </CompCancel>
          <Button
            variant={variant === "default" ? "default" : "destructive"}
            disabled={!!loading}
            onClick={onConfirm}
          >
            {loading === action && <Spinner />}
            {confirmText}
          </Button>
        </CompFooter>
      </CompRoot>
    </CompProvider>
  );
}

function DeleteActionDialogContent({
  title,
  description,
  deleteKeyword = "DELETE",
  action,
  confirmText = "Continue",
  deleteLabel = "Delete",
  cancelText = "Cancel",
  onConfirm,
}: {
  action: string;
  deleteKeyword?: string;
  deleteLabel?: string;
  onConfirm: () => void;
} & BaseActionDialogContentProps) {
  const { loading, open, setOpen } = useActionDialog();

  const form = useForm({
    defaultValues: {
      confirm: "",
    },
    validators: {
      onSubmit: z
        .object({
          confirm: z
            .string()
            .min(1, "Please provide a reason (at least 10 characters)"),
        })
        .refine((data) => data.confirm === deleteKeyword, {
          message: "The confirmation does not match the delete keyword",
          path: ["confirm"],
        }),
    },
    onSubmit: () => {
      onConfirm();
    },
  });

  return (
    <AlertDialog
      open={open === action}
      onOpenChange={(open) => setOpen(open ? action : null)}
    >
      <AlertDialogContent>
        <AlertDialogHeader className="text-start">
          <AlertDialogTitle>
            <span className="text-destructive">
              <AlertTriangleIcon
                className="stroke-destructive me-1 inline-block"
                size={18}
              />
              {title}
            </span>
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>{description}</div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <form.Field
            name="confirm"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>{deleteLabel}</FieldLabel>
                  <Input
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder={`Wpisz "${deleteKeyword}" aby potwierdzić`}
                    type="text"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />
        </form>

        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          <Button
            type="submit"
            form={action}
            variant="destructive"
            disabled={!!loading}
          >
            {loading === action && <Spinner />}
            {confirmText}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function FormActionDialogContent({
  action,
  title,
  description,
  children,
  confirmText = "Save",
  cancelText = "Cancel",
}: {
  action: string;
  children: React.ReactNode;
} & BaseActionDialogContentProps) {
  const { loading, open, setOpen } = useActionDialog();

  return (
    <Dialog
      open={open === action}
      onOpenChange={(open) => setOpen(open ? action : null)}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-start">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="h-105 w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3">
          {children}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{cancelText}</Button>
          </DialogClose>
          <Button type="submit" form={action} disabled={!!loading}>
            {confirmText}
            {loading === action && <Spinner />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export {
  ActionDialog,
  ActionDialogTrigger,
  ConfirmActionDialogContent,
  DeleteActionDialogContent,
  FormActionDialogContent,
};
