from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler


def success_response(message, data=None, status_code=200):
    """Standard success response for all APIs."""
    return Response(
        {
            "success": True,
            "message": message,
            "data": data if data is not None else [],
        },
        status=status_code,
    )


class StandardResultsSetPagination(PageNumberPagination):
    """Pagination wrapped in frontend-friendly standard JSON format."""

    page_size = 10
    page_size_query_param = "limit"
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response(
            {
                "success": True,
                "message": "Complaints fetched successfully.",
                "data": data,
                "pagination": {
                    "count": self.page.paginator.count,
                    "next": self.get_next_link(),
                    "previous": self.get_previous_link(),
                    "page": self.page.number,
                    "total_pages": self.page.paginator.num_pages,
                    "limit": self.get_page_size(self.request),
                },
            }
        )


def custom_exception_handler(exc, context):
    """
    Convert DRF errors to unified response:
    {
      "success": false,
      "message": "Error message"
    }
    """

    response = drf_exception_handler(exc, context)
    if response is None:
        return Response(
            {"success": False, "message": "Internal server error."},
            status=500,
        )

    detail = response.data
    message = "Something went wrong."

    if isinstance(detail, dict):
        if "detail" in detail:
            message = str(detail["detail"])
        else:
            # pick first validation error
            first_key = next(iter(detail.keys()), None)
            if first_key is not None:
                first_val = detail[first_key]
                if isinstance(first_val, (list, tuple)) and first_val:
                    message = str(first_val[0])
                else:
                    message = f"{first_key}: {first_val}"
    elif isinstance(detail, list) and detail:
        message = str(detail[0])
    elif detail:
        message = str(detail)

    response.data = {
        "success": False,
        "message": message,
    }
    return response
