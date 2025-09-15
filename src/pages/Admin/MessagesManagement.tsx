ubject}
                          </div>
                          <div className="text-sm text-gray-500 line-clamp-2">
                            {message.message}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {getPriorityIcon(message.priority)}
                            <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(message.priority)}`}>
                              {message.priority}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(message.status)}`}>
                            {message.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {getTimeAgo(message.createdAt)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(message.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewMessage(message)}
                              className="text-blue-600 hover:text-blue-900"
                              title="View Message"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteMessage(message._id)}
                              disabled={actionLoading === message._id}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              title="Delete Message"
                            >
                              {actionLoading === message._id ? (
                                <LoadingSpinner size="sm" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing{' '}
                        <span className="font-medium">{((currentPage - 1) * 10) + 1}</span>
                        {' '}to{' '}
                        <span className="font-medium">
                          {Math.min(currentPage * 10, totalMessages)}
                        </span>
                        {' '}of{' '}
                        <span className="font-medium">{totalMessages}</span>
                        {' '}results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="rounded-r-none"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        
                        {[...Array(Math.min(5, totalPages))].map((_, index) => {
                          const pageNumber = currentPage <= 3 
                            ? index + 1
                            : currentPage >= totalPages - 2
                            ? totalPages - 4 + index
                            : currentPage - 2 + index;
                          
                          if (pageNumber < 1 || pageNumber > totalPages) return null;
                          
                          return (
                            <Button
                              key={pageNumber}
                              variant={currentPage === pageNumber ? "primary" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNumber)}
                              className="rounded-none"
                            >
                              {pageNumber}
                            </Button>
                          );
                        })}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="rounded-l-none"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>

      {/* Message Detail Modal */}
      {showMessageModal && selectedMessage && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-90vh overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Message Details</h3>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(selectedMessage.priority)}`}>
                    {selectedMessage.priority}
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedMessage.status)}`}>
                    {selectedMessage.status}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Message Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="text-sm text-gray-900">{selectedMessage.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="text-sm text-gray-900">{selectedMessage.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="text-sm text-gray-900">{selectedMessage.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Received</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedMessage.createdAt)}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <p className="text-sm text-gray-900 font-medium">{selectedMessage.subject}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>

              {/* Existing Reply */}
              {selectedMessage.reply && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Previous Reply</label>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedMessage.reply.message}</p>
                    <div className="mt-2 text-xs text-gray-600">
                      Replied by {selectedMessage.reply.repliedBy.firstName} {selectedMessage.reply.repliedBy.lastName} 
                      on {formatDate(selectedMessage.reply.repliedAt)}
                    </div>
                  </div>
                </div>
              )}

              {/* Reply Form */}
              <form onSubmit={handleReplyToMessage}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {selectedMessage.reply ? 'Send Follow-up Reply' : 'Send Reply'}
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Type your reply here..."
                  required
                />
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center space-x-4">
                    <select
                      value={selectedMessage.status}
                      onChange={(e) => handleUpdateStatus(selectedMessage._id, e.target.value as any)}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="new">New</option>
                      <option value="read">Read</option>
                      <option value="replied">Replied</option>
                      <option value="closed">Closed</option>
                    </select>
                    <select
                      value={selectedMessage.priority}
                      onChange={(e) => handleUpdatePriority(selectedMessage._id, e.target.value as any)}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowMessageModal(false);
                        setSelectedMessage(null);
                        setReplyText('');
                      }}
                    >
                      Close
                    </Button>
                    <Button
                      type="submit"
                      loading={actionLoading === 'reply'}
                      disabled={!replyText.trim()}
                    >
                      <Reply className="w-4 h-4 mr-2" />
                      Send Reply
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMessagesManagement;