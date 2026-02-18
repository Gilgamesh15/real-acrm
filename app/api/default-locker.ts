import { inpostService } from "db/services/inpost.service";
import type { LoaderFunctionArgs } from "react-router";
import { type ActionFunctionArgs, data } from "react-router";

export async function loader({ context }: LoaderFunctionArgs) {
  const { logger } = context;
  const { session } = context;

  if (!session || !session.user) {
    logger.warn("Unauthorized attempt to get default locker");
    return data(
      {
        message: "Musisz być zalogowany, aby uzyskać domyślny paczkomat",
        locker: null,
      },
      { status: 401 }
    );
  }

  return await inpostService.getDefaultLocker(session.user.id);
}

export async function action({ request, context }: ActionFunctionArgs) {
  const { logger } = context;
  const { session } = context;

  if (!session || !session.user) {
    logger.warn("Unauthorized attempt to set default locker");
    return data(
      {
        message: "Musisz być zalogowany, aby ustawić domyślny paczkomat",
        locker: null,
      },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();
    const lockerName = formData.get("lockerName");

    if (!lockerName || typeof lockerName !== "string") {
      logger.warn("Missing or invalid locker name for set default locker", {
        userId: session.user.id,
        lockerName,
      });
      return data(
        {
          message: "Nazwa paczkomatu jest wymagana",
          locker: null,
        },
        { status: 400 }
      );
    }

    return await inpostService.setDefaultLocker(
      session.user.id,
      lockerName.trim()
    );
  } catch (error) {
    logger.error("Failed to set default locker", {
      error,
      userId: session.user.id,
    });
    return data(
      {
        message: "Nie udało się ustawić domyślnego paczkomatu",
        locker: null,
      },
      { status: 500 }
    );
  }
}
