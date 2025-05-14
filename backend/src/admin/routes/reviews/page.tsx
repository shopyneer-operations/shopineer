import { defineRouteConfig } from "@medusajs/admin-sdk";
import { CheckCircle, PencilSquare, StarSolid, Trash } from "@medusajs/icons";
import useIsAuthorized from "../../lib/hooks/use-is-authorized";
import { Resource } from "../../lib/data/permissions";
import { useState } from "react";
import { constants } from "../../lib/constants";
import useSWR from "swr";
import { sdk } from "../../lib/sdk";
import { PaginatedResponse } from "@medusajs/framework/types";
import { Review } from "../../lib/types/review";
import { Container, Heading, StatusBadge, toast, Toaster } from "@medusajs/ui";
import UnauthorizedMessage from "../../components/unauthorized-message";
import { Table } from "../../components/table";
import { RatingStars } from "./components/rating-stars";
import { RespondForm } from "./components/respond-form";
import { ActionMenu } from "../../components/action-menu";

export default function ReviewsPage() {
  const [isRepondDrawerOpen, setIsRespondDrawerOpen] = useState(false);

  const { isAuthorized, isLoading } = useIsAuthorized(Resource.reviews);
  const [currentPage, setCurrentPage] = useState(0);
  const offset = currentPage * constants.REVIEWS_LIMIT;

  const { data, mutate } = useSWR(["reviews", offset, isLoading, isAuthorized], () => {
    if (isLoading || !isAuthorized) {
      return { reviews: [], count: 0, offset: 0, limit: 0 };
    }

    return sdk.client.fetch<PaginatedResponse<{ reviews: Review[] }>>(`/admin/reviews`, {
      query: {
        limit: constants.ROLES_LIMIT,
        offset,
      },
    });
  });

  console.log("🔵🔵", data);

  async function deleteReview(id: string) {
    try {
      const { reviewId } = await sdk.client.fetch<{ reviewId: string }>(`/admin/reviews/${id}`, {
        method: "DELETE",
      });
      mutate();

      // Show success toast
      toast.success("تم حذف التقييم", { description: `تم حذف التقييم بنجاح` });

      return reviewId;
    } catch (error: any) {
      toast.error("فشل حذف التقييم", { description: error.message });
    }
  }

  async function approveReview(id: string) {
    try {
      const { reviewId } = await sdk.client.fetch<{ reviewId: string }>(`/admin/reviews/${id}/approve`, {
        method: "PUT",
      });
      mutate();

      // Show success toast
      toast.success("تم الموافقة على التقييم", { description: `تم الموافقة على التقييم بنجاح` });

      return reviewId;
    } catch (error: any) {
      toast.error("فشل الموافقة على التقييم", { description: error.message });
    }
  }

  return (
    <Container className="divide-y p-0">
      <Toaster />

      {!isAuthorized && <UnauthorizedMessage resource={Resource.reviews} />}

      <div className="flex items-center justify-between px-6 py-4">
        {/* <div> */}
        <Heading level="h2">التقييمات</Heading>
        {/* </div> */}
      </div>

      <Table
        columns={[
          //   {
          //     key: "customer.first_name",
          //     label: "User",
          //   },
          {
            key: "title",
            label: "العنوان",
          },
          {
            key: "description",
            label: "المحتوى",
          },
          {
            key: "approved_at",
            label: "الحالة",
            render(review: Review) {
              return review.approved_at ? (
                <StatusBadge color="green">موافق</StatusBadge>
              ) : (
                <StatusBadge>قيد المراجعة</StatusBadge>
              );
            },
          },
          {
            key: "rating",
            label: "التقييم",
            render(review: Review) {
              return <RatingStars rating={review.rating} />;
            },
          },
          {
            key: "product.title",
            label: "المنتج",
          },
          {
            key: "actions",
            label: "الإجراءات",
            render(review: Review & { response?: { text: string } }) {
              return (
                <div className="flex items-center gap-x-2">
                  <ActionMenu
                    groups={[
                      {
                        actions: [
                          {
                            icon: <PencilSquare />,
                            label: "الرد",
                            onClick: () => setIsRespondDrawerOpen(true),
                            disabled: Boolean(review.response),
                          },
                          {
                            icon: <CheckCircle />,
                            label: "موافقة",
                            onClick: () => approveReview(review.id),
                            disabled: Boolean(review.approved_at),
                          },
                          {
                            icon: <Trash />,
                            label: "حذف",
                            onClick: () => deleteReview(review.id),
                          },
                        ],
                      },
                    ]}
                  />

                  <RespondForm
                    review={review}
                    onSubmit={() => setIsRespondDrawerOpen(false)}
                    isOpen={isRepondDrawerOpen}
                    setIsOpen={setIsRespondDrawerOpen}
                  />
                </div>
              );
            },
          },
        ]}
        data={data?.reviews || []}
        count={data?.count || 0}
        pageSize={data?.limit || constants.REVIEWS_LIMIT}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </Container>
  );
}

export const config = defineRouteConfig({
  label: "التقييمات",
  icon: StarSolid,
});
