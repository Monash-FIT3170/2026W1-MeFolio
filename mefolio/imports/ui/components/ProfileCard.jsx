import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { PortfolioCollection } from "../../api/portfolio";

export const ProfileCard = () => {
  const { portfolio, isLoading } = useTracker(() => {
    const handle = Meteor.subscribe("portfolios.all");
    const userId = Meteor.userId();
    const portfolio =
      PortfolioCollection.findOne({ userId }) || PortfolioCollection.findOne();

    return {
      portfolio,
      isLoading: !handle.ready(),
    };
  });

  if (isLoading || !portfolio) {
    return (
      <div className="aspect-square w-full flex items-center justify-center text-slate-500">
        Loading profile...
      </div>
    );
  }

  const profile = portfolio.profile || {};

  const name = profile.fullName || profile.name || "No name set";
  const location = profile.location || "";

  const imageUrl = profile.avatarUrl || profile.avatar || null;

  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <div className="w-full aspect-square rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-[2px]">
      <div className="w-full h-full rounded-2xl bg-background flex items-center justify-center">
        <div className="text-left px-8 py-12">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="w-48 h-48 mx-auto rounded-full object-cover mb-4"
            />
          ) : (
            <div className="w-48 h-48 mx-auto rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-secondary text-6xl font-bold mb-4">
              {initials}
            </div>
          )}

          <p className="text-xl font-semibold text-primary">
            {portfolio.title || "Portfolio"}
          </p>

          {name && <p className="text-base text-muted mt-1">{name}</p>}

          {location && <p className="text-sm text-muted mt-1">{location}</p>}
        </div>
      </div>
    </div>
  );
};
